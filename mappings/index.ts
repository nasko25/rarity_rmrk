import BN from 'bn.js'
import { DatabaseManager, EventContext, StoreContext, AnyJsonField } from '@subsquid/hydra-common'
import { Account, HistoricalBalance } from '../generated/model'
import { Balances } from '../chain'
import { Consolidator as ConsolidatorV1 } from './consolidator_v1';
import { Consolidator as ConsolidatorV2 } from './consolidator_v2';
import { hexToString, stringToHex } from "@polkadot/util";
import { DBAdapter } from '../using_rmrk_tools/DBAdapter';
import { DBAdapterV1 } from '../using_rmrk_tools/DBAdapterV1';


export async function balancesTransfer({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {

  const [from, to, value] = new Balances.TransferEvent(event).params
  const tip = extrinsic ? new BN(extrinsic.tip.toString(10)) : new BN(0)

  const fromAcc = await getOrCreate(store, Account, from.toHex())
  fromAcc.wallet = from.toHuman()
  fromAcc.balance = fromAcc.balance || new BN(0)
  fromAcc.balance = fromAcc.balance.sub(value)
  fromAcc.balance = fromAcc.balance.sub(tip)
  await store.save(fromAcc)

  const toAcc = await getOrCreate(store, Account, to.toHex())
  toAcc.wallet = to.toHuman()
  toAcc.balance = toAcc.balance || new BN(0)
  toAcc.balance = toAcc.balance.add(value)
  await store.save(toAcc)

  const hbFrom = new HistoricalBalance()
  hbFrom.account = fromAcc;
  hbFrom.balance = fromAcc.balance;
  hbFrom.timestamp = new BN(block.timestamp)
  await store.save(hbFrom)

  const hbTo = new HistoricalBalance()
  hbTo.account = toAcc;
  hbTo.balance = toAcc.balance;
  hbTo.timestamp = new BN(block.timestamp)
  await store.save(hbTo)
}


async function getOrCreate<T extends {id: string}>(
  store: DatabaseManager,
  entityConstructor: EntityConstructor<T>,
  id: string
): Promise<T> {

  let e = await store.get(entityConstructor, {
    where: { id },
  })

  if (e == null) {
    e = new entityConstructor()
    e.id = id
  }

  return e
}


type EntityConstructor<T> = {
  new (...args: any[]): T
}

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
// const getRemarksFromBlocks = (blocks: RemarkBlock[], prefixes: string[]) => {
//     const remarks = [];
//     for (const row of blocks) {
//         for (const call of row.calls) {
//             if (call.call !== "system.remark")
//                 continue;
//             const str = hexToString(call.value);
//             if (!prefixes.some((word) => str.startsWith(hexToString(word)))) {
//                 continue;
//             }
//             const meta = getMeta(call, row.block);
//             if (!meta)
//                 continue;
//             let remark;
//             switch (meta.type) {
//                 case "MINTNFT":
//                 case "MINT":
//                     remark = decodeURI(hexToString(call.value));
//                     break;
//                 default:
//                     remark = hexToString(call.value);
//                     break;
//             }
//             const r = {
//                 block: row.block,
//                 caller: call.caller,
//                 interaction_type: meta.type,
//                 version: meta.version,
//                 remark: remark,
//                 extra_ex: undefined,
//             };
//             remarks.push(r);
//         }
//     }
//     return remarks;
// };

const getRemarksFromBlocks = (blocks: RemarkBlock[], prefixes: string[]) => {
    const remarks: { v1: any[], v2: any[] } = { v1: [], v2: [] };
    for (const row of blocks) {
        for (const call of row.calls) {
            if (call.call !== "system.remark")
                continue;
            console.log("it is a remark")
            const str = hexToString(call.value);
            // console.log(prefixes, str, prefixes.some((word) => str.startsWith(hexToString(word))))
            if (!prefixes.some((word) => str.startsWith(hexToString(word)))) {
                continue;
            }
            console.log("has right prefix")
            const meta = getMeta(call, row.block);
            if (!meta)
                continue;
            console.log("has meta")
            let remark;
            if (str.includes("::2.0.0::")) {
                console.log("is v2.0.0 of type", meta.type);
                switch (meta.type) {
                    case OP_TYPES.MINT:
                        console.log("is mint!");
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
    // TODO for some reason some v2.0.0 rmrks are not extracted from the blocks,
    //  such as MINT and CREATE
    console.log(calls)
    const remarks = getRemarksFromBlocks([new RemarkBlock(block.height, calls)], ["0x726d726b", "0x524d524b"]);
    console.log(remarks.v2);
    // check if some rmrks are not processed
    if (remarks.v1.length + remarks.v2.length !== calls.length)
        process.exit(-1);

    const dbAdapterV1 = new DBAdapterV1(store);
    const dbAdapterV2 = new DBAdapter(store);
    // TODO use the two dbAdapters with the library consolidator?
    //  then only the getRemarksFromBlocks() will need to be overwritten
    const consolidator_v1 = new ConsolidatorV1(dbAdapterV1, undefined, false, false);
    const consolidator_v2 = new ConsolidatorV2(dbAdapterV2, undefined, false, false);
    const { nfts, collections } = await consolidator_v1.consolidate(remarks.v1);
    await consolidator_v2.consolidate(remarks.v2);
    // console.log('Consolidated nfts:', nfts);
    // console.log('Consolidated collections:', collections);
    /*
    for (let remark of remarks) {
        /*
        remarks:
        [
            {
                block: 9468357,
                caller: 'D6HSL6nGXHLYWSN8jiL9MSNixH2F2o382KkHsZAtfZvBnxM',
                interaction_type: 'BURN',
                version: '2.0.0',
                remark: 'RMRK::BURN::2.0.0::9467206-9cba890074545f2e7c-KANPRTN-khala_sunglasses_Colorful-00000NaN',
                extra_ex: undefined || Call[]
            }
        ]
        */
        /*
        let rmrk = new Rmrk();
        rmrk.caller = remark.caller;
        rmrk.interactionType = remark.interaction_type;
        rmrk.rmrkVersion = remark.version;
        rmrk.remark = remark.remark;
        if (remark?.extra_ex) {
            let rmrkExtraEx = [];
            for (const remark_extra of remark.extra_ex) {
                let extraEx = new RmrkCall();
                extraEx.call = remark_extra.call;
                extraEx.value = remark_extra.value;
                extraEx.caller = remark_extra.caller;
                rmrkExtraEx.push(extraEx);
            }
            rmrk.extraEx = rmrkExtraEx;
        }
        let rmrkEntity = new RmrkEntity();
        rmrkEntity.block = new BN(remark.block);
        rmrkEntity.rmrk = rmrk;
        // otherwise rmrk.extraEx will be undefined
        await store.save<RmrkEntity>(rmrkEntity);
        // process.exit(0);
    }
    */
    // store.save<SubstrateBlock>(block)

    // TODO error checks; don't assume all nfts follow the standard
    /*
    let ext_val = extrinsic?.args[0]?.value;
    // nft remarks should start with rmrk or RMRK
    if (ext_val?.toString().startsWith("0x726d726b") || ext_val?.toString().startsWith("0x524d524b")) {
        let parsed_rmrk;
        try {
            parsed_rmrk = parse_rmrk(ext_val);
            // if parsed_rmrk is not defined or is empty, just return
            // parse_rmrk would have thrown an error if something is wrong
            if(parsed_rmrk === undefined)
                return;
            console.log(JSON.stringify(parsed_rmrk) + "\n");
        } catch (err) {
            console.error(err);
            process.exit(-1);
            return;
        }

        // TODO code duplication; also there should be a more elegant solution
        // TODO do checks for all versions and interactions
        // TODO fetch metadata; or spawn a process that does that
        // minting a collection
        if ((parsed_rmrk.version === undefined || parsed_rmrk.version === "RMRK0.1" || parsed_rmrk.version === "1.0.0" || parsed_rmrk.version === "RMRK1.0.0") && (parsed_rmrk.interaction === "MINT" || parsed_rmrk.interaction === "mint")) {
            // check if the rmrk collection is valid
            if (!checkRmrkCollectionValid(parsed_rmrk.rmrk)) {
                console.error(`Collection "${parsed_rmrk.rmrk.name}" is not following rmrk guidelines, so it cannot be parsed.`);
                process.exit(-1);
                return;
            }
            // mint a v0.1 or v1.0.0 collection
            let collection = new Collection();
            collection.id = parsed_rmrk.rmrk.id;
            collection.name = parsed_rmrk.rmrk.name;
            collection.max = new BN(parsed_rmrk.rmrk.max);
            collection.issuer = parsed_rmrk.rmrk.issuer;
            collection.symbol = parsed_rmrk.rmrk.symbol;
            collection.metadata = parsed_rmrk.rmrk.metadata;
            collection.rmrkVersion = parsed_rmrk.version;

            await store.save(collection);
        }
        else if (parsed_rmrk.version === "2.0.0" && (parsed_rmrk.interaction === "CREATE" || parsed_rmrk.interaction === "create")) {
            if (!checkRmrkCollectionV2Valid(parsed_rmrk.rmrk)) {
                console.error(`Collection "${parsed_rmrk.rmrk.id}" is not following rmrk guidelines, so it cannot be parsed.`);
                process.exit(-1);
                return;
            }
            let collection = new Collection();
            collection.id = parsed_rmrk.rmrk.id;
            collection.max = new BN(parsed_rmrk.rmrk.max);
            collection.issuer = parsed_rmrk.rmrk.issuer;
            collection.symbol = parsed_rmrk.rmrk.symbol;
            collection.metadata = parsed_rmrk.rmrk.metadata;
            collection.rmrkVersion = parsed_rmrk.version;

            await store.save(collection);
        }
        // spec version 0.1 had a bug in that it did not specify a standard version in the MINT and MINTNFT interactions. When the version is missing from the MINT, it should be assumed to mean 0.1
        //  (taken from the documentation)
        else if (((parsed_rmrk.version === undefined || parsed_rmrk.version === "RMRK0.1" || parsed_rmrk.version === "1.0.0" || parsed_rmrk.version === "RMRK1.0.0") && (parsed_rmrk.interaction === "MINTNFT" || parsed_rmrk.interaction === "mintnft")) || (parsed_rmrk.version === "2.0.0" && (parsed_rmrk.interaction === "MINT" || parsed_rmrk.interaction === "mint"))){
            if (!checkRmrkNftValid(parsed_rmrk.rmrk)) {
                console.error(`Nft "${parsed_rmrk.rmrk.id}" is not following rmrk guidelines, so it cannot be parsed.`);
                process.exit(-1);
                return;
            }
            // mint a v0.1 or v1.0.0 nft
            let nft = new Nft();
            nft.collection = parsed_rmrk.rmrk.collection;
            nft.symbol = parsed_rmrk.rmrk.symbol;
            nft.transferable = new BN(parsed_rmrk.rmrk.transferable);
            nft.sn = parsed_rmrk.rmrk.sn;
            nft.metadata = parsed_rmrk.rmrk.metadata;
            nft.rmrkVersion = parsed_rmrk.version;

            await store.save(nft)
        }
        else if (((parsed_rmrk.version === "RMRK0.1" || parsed_rmrk.version === "1.0.0" || parsed_rmrk.version === "RMRK1.0.0") && (parsed_rmrk.interaction === "consume" || parsed_rmrk.interaction === "CONSUME")) || (parsed_rmrk.version === "2.0.0" && parsed_rmrk.interaction === "BURN")) {
            let removedNft;
            if (parsed_rmrk.version === "2.0.0") {
                removedNft = store.get(Nft, { where: { collection: parsed_rmrk.rmrk.collection, sn: parsed_rmrk.rmrk.sn } });
            }
            else {
                removedNft = store.get(Nft, { where: { collection: parsed_rmrk.rmrk.collection, sn: parsed_rmrk.rmrk.sn } });
            }
            let nftToRemove = await removedNft;
            // if the nft is in the storage, remove it
            // otherwise don't do anything
            if (nftToRemove)
                await store.remove(nftToRemove);
            // TODO remove else case
            else {
                console.error("Nft to burn is not in the database");
                process.exit(-1);
            }
        }

        // TODO remove:
        // process.exit(1);
    }
   */
}

const possible_interactions = [
    // v0.1
    "MINT",
    "CHANGEISSUER",
    "MINTNFT",
    "SEND",
    "LIST",
    "BUY",
    "CONSUME",

    // v1.0.0
    "EMOTE",

    // v2.0.0
    "ACCEPT",
    "BASE",
    "BURN",
    "CREATE",
    "EQUIP",
    "EQUIPPABLE",
    "LOCK",
    "RESADD",
    "SETPROPERTY",
    "SETPRIORITY",
    "THEMEADD",
];

const implemented_interactions = [
    "BURN",
    "CONSUME",
    "MINT",
    "MINTNFT",
    "CREATE"
];

// a Map object that has the rmrk version as a key and the handler for that version as a value
const possible_versions = new Map([
    // version 0.1 is treated differently as it is inside a JSON object
    ["1.0.0", rmrk_v1_handler],
    ["RMRK1.0.0", rmrk_v1_handler],
    ["2.0.0", rmrk_v2_handler],
]);

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

// parse rmrk value parse handlers, based on rmrk version
function rmrk_v1_handler(rmrk_str: string) {
    // TODO check if the object format is as expected
    return JSON.parse(rmrk_str);
}

function rmrk_v2_handler(rmrk_str: string, interaction: string) {
    // TODO check if the object format is as expected

    // MINT interactions have an optional recepient
    if (interaction === "MINT" || interaction === "mint") {
        let rmrk_split = rmrk_str.split("::");
        if (rmrk_split.length === 1)
            return JSON.parse(rmrk_str);
        else if (rmrk_split.length === 2) {
            let parsed_rmrk = JSON.parse(rmrk_split[0]);
            parsed_rmrk.recepient = rmrk_split[1];
            return parsed_rmrk;
        }
    }
    return JSON.parse(rmrk_str);
}

function parse_rmrk(ext_val: AnyJsonField) {
    // rmrkv0.1:
    // rmrk::MINT::%7B%22version%22%3A%22RMRK0.1%22%2C%22name%22%3A%22Dot+Leap+Early+Promoters%22%2C%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22id%22%3A%220aff6865bed3a66b-DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D

    // rmrkv1.0.0:
    // rmrk::MINT::1.0.0::%7B%22name%22%3A%22Dot+Leap+Early+Promoters%22%2C%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22id%22%3A%220aff6865bed3a66b-DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D

    // rmrkv2.0.0
    // minting to someone else's account:
    // rmrk::MINT::2.0.0::%7B%22collection%22%3A%220aff6865bed3a66b-DLEP%22%2C%22symbol%22%3A%22DL15%22%2C%22transferable%22%3A1%2C%22sn%22%3A%2200000001%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmavoTVbVHnGEUztnBT2p3rif3qBPeCfyyUE5v4Z7oFvs4%22%7D::CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp
    // not minting to someone else's account:
    // rmrk::MINT::2.0.0::%7B%22collection%22%3A%220aff6865bed3a66b-DLEP%22%2C%22symbol%22%3A%22DL15%22%2C%22transferable%22%3A1%2C%22sn%22%3A%2200000001%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmavoTVbVHnGEUztnBT2p3rif3qBPeCfyyUE5v4Z7oFvs4%22%7D

    let rmrk_str = decodeURIComponent(Buffer.from(ext_val.toString().substring(2), "hex").toString().replace(/\+/g, ' '));
    // remove the beginning ("rmrk::")
    rmrk_str = rmrk_str.substring(6);

    // read until the next "::" to get the type of interaction
    let interaction = rmrk_str.substring(0, rmrk_str.indexOf("::"));
    if (!implemented_interactions.includes(interaction))
        return;

    if (!possible_interactions.includes(interaction))
        throw new InvalidInteraction(`The interaction provided (${interaction}) is not a valid interaction.`);

    // remove the interaction from the rmrk string
    rmrk_str = rmrk_str.substring(rmrk_str.indexOf("::") + 2);

    // get the version for v1.0.0 and v2.0.0
    let version = rmrk_str.substring(0, rmrk_str.indexOf("::"));

    let rmrk;
    // if the rmrk is "BURN" and the version is "2.0.0" or "CONSUME" for "0.1" and "1.0.0", then parse the id of the nft to burn after the ::
    if ((version === "2.0.0" && (interaction === "BURN" || interaction === "burn")) || ((version === "0.1" || version === "1.0.0" || version === "RMRK1.0.0" || version === "undefined") && (interaction === "CONSUME" || interaction === "consume"))) {
        // remove the version from the rmrk string
        rmrk_str = rmrk_str.substring(rmrk_str.indexOf("::") + 2);
        rmrk = parseBURN(rmrk_str);
    }
    else if (possible_versions.has(version) && interaction !== "BURN" && interaction !== "burn") {
        let handler = possible_versions.get(version);
        // this is just to make typescript happy, handler is always defined (this is what the if statement checks)
        rmrk = handler === undefined ? undefined : handler(rmrk_str.substring(rmrk_str.indexOf("::") + 2), interaction);
    }
    // otherwise, try to JSON.parse the object after :: (assuming it is v0.1)
    else {
        try {
            // if the version is actually "undefined", trim the rmrk string
            if (version === "undefined")
                rmrk_str = rmrk_str.substring(rmrk_str.indexOf("::") + 2);
            rmrk = JSON.parse(rmrk_str);
            version = rmrk.version ? rmrk.version : "RMRK0.1";
        } catch (err) {
            throw new InvalidRMRKFormat(`Encountered a rmrk (${rmrk_str}) with invalid format.`);
        }
        if (rmrk.version !== "RMRK0.1" && rmrk.version !== "rmrk0.1" && rmrk.version !== undefined)
            throw new InvalidRMRKFormat("Invalid rmrk version.");
    }

    // let rmrk = JSON.parse(rmrk_str);
    return { rmrk: rmrk, interaction: interaction, version: version };
}

// helper function that parses the NFT to burn's parameters from a BURN v2.0.0 interaction
function parseBURN(rmrk_str: string) {
    // 5105000-0aff6865bed3a66b-VALHELLO-POTION_HEAL-00000001
    const rmrk_split = rmrk_str.split("-");
    if (rmrk_split.length !== 5)
        throw new InvalidRMRKFormat("Invalid rmrk BURN interaction format.");
    const blockNumber = rmrk_split[0];
    const collectionName = rmrk_split[1] + "-" + rmrk_split[2];
    const nftName = rmrk_split[3];
    const sn = rmrk_split[4];

    return { collection: collectionName, name: nftName, sn };
}

// TODO check metadata formats; they should be a valid HTTP or ipfs url
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
