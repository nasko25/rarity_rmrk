import BN from 'bn.js'
import { DatabaseManager, EventContext, StoreContext, BlockContext, AnyJsonField, SubstrateExtrinsic } from '@subsquid/hydra-common'
import { Account, HistoricalBalance } from '../generated/model'
import { Balances } from '../chain'
import { Consolidator as ConsolidatorV1 } from './consolidator_v1';
import { Consolidator as ConsolidatorV2 } from './consolidator_v2';
import { hexToString, stringToHex } from "@polkadot/util";
import { DBAdapter } from '../using_rmrk_tools/DBAdapter';
import { DBAdapterV1 } from '../using_rmrk_tools/DBAdapterV1';

// how many utility.batch extrinsics will be parsed asynchronously at once in one batch
// bigger number requires more memory, but will parse utility.batch extrinsics faster
const ASYNC_UTILITY_BATCH_SIZE = 100;

type Call = {
    call: string,
    value: string,
    caller: string
};

class RemarkBlock {
    block: number;
    calls: Call[];

    constructor(block: number, calls: Call[]) {
        this.block = block;
        this.calls = calls;
    }
}

// code taken from node_modules/rmrk-tools
const VERSION = "2.0.0";
const PREFIX = "RMRK";
enum OP_TYPES {
    BUY = "BUY",
    LIST = "LIST",
    CREATE = "CREATE",
    MINT = "MINT",
    SEND = "SEND",
    EMOTE = "EMOTE",
    CHANGEISSUER = "CHANGEISSUER",
    BURN = "BURN",
    BASE = "BASE",
    EQUIPPABLE = "EQUIPPABLE",
    THEMEADD = "THEMEADD",
    RESADD = "RESADD",
    ACCEPT = "ACCEPT",
    EQUIP = "EQUIP",
    SETPROPERTY = "SETPROPERTY",
    LOCK = "LOCK",
    SETPRIORITY = "SETPRIORITY"
}
const getMeta = (call: Call, block: number) => {
    const str = hexToString(call.value);
    const arr = str.split("::");
    if (arr.length < 3) {
        console.error(`Invalid RMRK in block ${block}: ${str}`);
        return false;
    }
    return {
        type: arr[1],
        version: parseFloat(arr[2]) ? arr[2] : "0.1",
    };
};

const getRemarksFromBlocks = (blocks: RemarkBlock[], prefixes: string[]) => {
    const remarks: { v1: any[], v2: any[] } = { v1: [], v2: [] };
    for (const row of blocks) {
        for (const call of row.calls) {
            if (call.call !== "system.remark")
                continue;
            const str = hexToString(call.value);
            // console.log(prefixes, str, prefixes.some((word) => str.startsWith(hexToString(word))))
            if (!prefixes.some((word) => str.startsWith(hexToString(word)))) {
                continue;
            }
            const meta = getMeta(call, row.block);
            if (!meta)
                continue;
            let remark;
            if (str.includes("::2.0.0::")) {
                switch (meta.type) {
                    case OP_TYPES.MINT:
                    case OP_TYPES.CREATE:
                    case OP_TYPES.RESADD:
                    case OP_TYPES.THEMEADD:
                    case OP_TYPES.SETPROPERTY:
                    case OP_TYPES.SETPRIORITY:
                    case OP_TYPES.BASE:
                        remark = decodeURI(hexToString(call.value));
                        break;
                    default:
                        remark = hexToString(call.value);
                        break;
                }
                const r = {
                    block: row.block,
                    caller: call.caller,
                    interaction_type: meta.type,
                    version: meta.version,
                    remark: remark,
                    extra_ex: undefined,
                };
                remarks.v2.push(r);
            } else {
                switch (meta.type) {
                    case "MINTNFT":
                    case "MINT":
                        remark = decodeURI(hexToString(call.value));
                        break;
                    default:
                        remark = hexToString(call.value);
                        break;
                }
                const r = {
                    block: row.block,
                    caller: call.caller,
                    interaction_type: meta.type,
                    version: meta.version,
                    remark: remark,
                    extra_ex: undefined,
                };
                remarks.v1.push(r);
            }

        }
    }
    return remarks;
};

async function extractRmrks(calls: Call[], { block, store }: BlockContext & StoreContext) {
    // TODO for some reason some v2.0.0 rmrks are not extracted from the blocks,
    //  such as MINT and CREATE
    //  (it is probably because they are packed in a utility.batch call)
    const remarks = getRemarksFromBlocks([new RemarkBlock(block.height, calls)], ["0x726d726b", "0x524d524b"]);
    // check if some rmrks are not processed
    if (remarks.v1.length + remarks.v2.length !== calls.length)
        process.exit(-1);

    const dbAdapterV1 = new DBAdapterV1(store);
    const dbAdapterV2 = new DBAdapter(store);
    // use the two dbAdapters with the library consolidator
    //  so only the getRemarksFromBlocks() had to be overwritten
    const consolidator_v1 = new ConsolidatorV1(dbAdapterV1, undefined, false, false);
    const consolidator_v2 = new ConsolidatorV2(dbAdapterV2, undefined, false, false);
    const { nfts, collections } = await consolidator_v1.consolidate(remarks.v1);
    await consolidator_v2.consolidate(remarks.v2);
    // console.log('Consolidated nfts:', nfts);
    // console.log('Consolidated collections:', collections);
}

// handle system.remarks inside utility.batch calls
export async function utilityBatch({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {
    if (!extrinsic || !extrinsic.args || extrinsic.args.length !== 1) {
        console.error("Unexpected extrinsic format.");
        process.exit(-1);
        return;
    }

    let ext_val = extrinsic?.args[0]?.value;
    if (ext_val && Array.isArray(ext_val)) {
        await parseUtilityBatch(ext_val, { block, store }, extrinsic);
    }
}

// parse utility.batch() extrinsics in async batches each of ASYNC_UTILITY_BATCH_SIZE
// the other alternative is to execute them all synchronously, but that will be slower; or if all rmrks are parsed asynchronously, usually that results in a heap memory overflow
async function parseUtilityBatch(ext_val: Array<any>, { block, store } : BlockContext & StoreContext, extrinsic: SubstrateExtrinsic) {
    let promises: Promise<any>[] = [];
    for (var arg of ext_val) {
        // for every ASYNC_UTILITY_BATCH_SIZE wait until all promises are completed
        if (promises.length == ASYNC_UTILITY_BATCH_SIZE) {
            console.log(`${ ASYNC_UTILITY_BATCH_SIZE } extrinsics from utility.batch() were just parsed.`)
            await Promise.all(promises);
            promises = [];
        }
        // whenever they are done add at most ASYNC_UTILITY_BATCH_SIZE more
        if (arg?.args?.remark && (arg.args.remark.startsWith("0x726d726b") || arg.args.remark.startsWith("0x524d524b"))) {
            // TODO remove
            console.error("utility.batch() also has remark");
            process.exit(-1);
            // await extractRmrks([<Call> { call: /* extrinsic.section + "." + extrinsic.method or arg.name */ "system.remark", value: arg.args.remark, caller: extrinsic.signer }], { block, store })
        } else if (arg?.args?._remark && (arg.args._remark.startsWith("0x726d726b") || arg.args._remark.startsWith("0x524d524b"))) {
            // console.log("utility batch")
            promises.push(extractRmrks([<Call> { call: /* extrinsic.section + "." + extrinsic.method or arg.name */ "system.remark", value: arg.args._remark, caller: extrinsic.signer }], { block, store }));
        }
    }
    // wait for all promises left to finish before returning
    await Promise.all(promises);
}

// TODO unit tests
export async function systemRemark({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {
    if (!extrinsic || !extrinsic.args || extrinsic.args.length !== 1) {
        console.error("Unexpected extrinsic format.");
        process.exit(-1);
        return;
    }

    // console.log(event, block);
    let ext_val = extrinsic?.args[0]?.value;
    // return if the extrinsic is not a rmrk
    if (!ext_val?.toString().startsWith("0x726d726b") && !ext_val?.toString().startsWith("0x524d524b")) {
        return;
    }
    let calls = [];
    for (const arg of extrinsic.args) {
        calls.push(<Call> { call: /* extrinsic.section + "." + extrinsic.method or arg.name */ "system.remark", value: arg.value, caller: extrinsic.signer });
    }

    // TODO await?
    await extractRmrks(calls, { block, store });
}

// errors
export class InvalidInteraction extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "InvalidInteraction";
    }
}

export class InvalidRMRKFormat extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "InvalidRMRKFormat";
    }
}

// helper function that check whether the parsed rmrk follows the guidelines
function checkRmrkCollectionValid(rmrk: any) {
    // since max is a number, it is allowed for it to be 0
    return rmrk.id && rmrk.name && rmrk.max !== undefined && rmrk.issuer && rmrk.symbol && rmrk.metadata && checkMetadataUrl(rmrk.metadata);
}

function checkRmrkCollectionV2Valid(rmrk: any) {
    // TODO remove the if statement and process.exit
    // TODO also what to do with properties
    if (rmrk.properties)
        process.exit(1);
    // since max is a number, it is allowed for it to be 0
    return rmrk.id && rmrk.max !== undefined && rmrk.issuer && rmrk.symbol && rmrk.metadata && checkMetadataUrl(rmrk.metadata);
}

function checkRmrkNftValid(rmrk: any) {
    return rmrk.collection && rmrk.symbol && rmrk.transferable && rmrk.sn && rmrk.metadata && checkMetadataUrl(rmrk.metadata);
}

function checkMetadataUrl(metadata: string) {
    const url: URL = new URL(metadata);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "ipfs:";
}
