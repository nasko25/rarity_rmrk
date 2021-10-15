import BN from 'bn.js'
import { DatabaseManager, EventContext, StoreContext, AnyJsonField } from '@subsquid/hydra-common'
import { Account, HistoricalBalance, Nft, Collection } from '../generated/model'
import { Balances } from '../chain'
import { hexToString, stringToHex } from "@polkadot/util";
import { NftWhereArgs } from '../generated/warthog';


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

// TODO unit tests
export async function systemRemark({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {

    if (!extrinsic || !extrinsic.args || extrinsic.args.length !== 1) {
        console.error("Unexpected extrinsic format.");
        return;
    }
    // TODO error checks; don't assume all nfts follow the standard
    let ext_val = extrinsic?.args[0]?.value;
    // nft remarks should start with rmrk or RMRK
    if (ext_val?.toString().startsWith("0x726d726b") || ext_val?.toString().startsWith("0x524d524c")) {
        console.log("rmrk encountered\n");
        let parsed_rmrk;
        try {
            parsed_rmrk = parse_rmrk(ext_val);
            console.log(JSON.stringify(parsed_rmrk) + "\n");
        } catch (err) {
            console.error(err);
            return;
        }

        // TODO code duplication; also there should be a more elegant solution
        // TODO do checks for all versions and interactions
        // TODO fetch metadata; or spawn a process that does that
        // minting a collection
        if (parsed_rmrk.version === undefined || parsed_rmrk.version === "RMRK0.1" || parsed_rmrk.version === "1.0.0" && (parsed_rmrk.interaction === "MINT" || parsed_rmrk.interaction === "mint")) {
            // check if the rmrk collection is valid
            if (!checkRmrkCollectionValid(parsed_rmrk.rmrk)) {
                console.error(`Collection "${parsed_rmrk.rmrk.name}" is not following rmrk guidelines, so it cannot be parsed.`);
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

            await store.save(collection);
        }
        else if (parsed_rmrk.version === "2.0.0" && (parsed_rmrk.interaction === "CREATE" || parsed_rmrk.interaction === "create")) {
            if (!checkRmrkCollectionV2Valid(parsed_rmrk.rmrk)) {
                console.error(`Collection "${parsed_rmrk.rmrk.id}" is not following rmrk guidelines, so it cannot be parsed.`);
                return;
            }
            let collection = new Collection();
            collection.id = parsed_rmrk.rmrk.id;
            collection.max = new BN(parsed_rmrk.rmrk.max);
            collection.issuer = parsed_rmrk.rmrk.issuer;
            collection.symbol = parsed_rmrk.rmrk.symbol;
            collection.metadata = parsed_rmrk.rmrk.metadata;

            await store.save(collection);
        }
        // spec version 0.1 had a bug in that it did not specify a standard version in the MINT and MINTNFT interactions. When the version is missing from the MINT, it should be assumed to mean 0.1
        //  (taken from the documentation)
        else if ((parsed_rmrk.version === undefined || parsed_rmrk.version === "RMRK0.1" || parsed_rmrk.version === "1.0.0" || parsed_rmrk.version === "2.0.0") && (parsed_rmrk.interaction === "MINTNFT" || parsed_rmrk.interaction === "mintnft")) {
            // mint a v0.1 or v1.0.0 nft
            let nft = new Nft();
            nft.collection = parsed_rmrk.rmrk.collection;
            nft.symbol = parsed_rmrk.rmrk.symbol;
            nft.transferrable = new BN(parsed_rmrk.rmrk.transferrable);
            nft.sn = parsed_rmrk.rmrk.sn;
            nft.metadata = parsed_rmrk.rmrk.metadata;

            await store.save(nft)
        }
        else if (((parsed_rmrk.version === "RMRK0.1" || parsed_rmrk.version === "1.0.0") && (parsed_rmrk.interaction === "consume" || parsed_rmrk.interaction === "CONSUME")) || (parsed_rmrk.version === "2.0.0" && parsed_rmrk.interaction === "BURN")) {
            const removedNft = store.findOne(Nft, { id: parsed_rmrk.rmrk.id });
            await store.remove(removedNft);
        }

        // TODO remove:
        // process.exit(1);
    }
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

// a Map object that has the rmrk version as a key and the handler for that version as a value
const possible_versions = new Map([
    // version 0.1 is treated differently as it is inside a JSON object
    //  TODO or maybe not? https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk0.1/interactions/consume.md#examples
    ["1.0.0", rmrk_v1_handler],
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

function rmrk_v2_handler(rmrk_str: string) {
    // TODO check if the object format is as expected
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
    console.log(interaction)

    if (!possible_interactions.includes(interaction))
        throw new InvalidInteraction(`The interaction provided (${interaction}) is not a valid interaction.`);

    // remove the interaction from the rmrk string
    rmrk_str = rmrk_str.substring(rmrk_str.indexOf("::") + 2);

    // get the version for v1.0.0 and v2.0.0
    let version = rmrk_str.substring(0, rmrk_str.indexOf("::"));

    let rmrk;
    if (possible_versions.has(version)) {
        let handler = possible_versions.get(version);
        // this is just to make typescript happy, handler is always defined (this is what the if statement checks)
        rmrk = handler === undefined ? undefined : handler(rmrk_str.substring(rmrk_str.indexOf("::") + 2));
    }
    // otherwise, try to JSON.parse the object after :: (assuming it is v0.1)
    else {
        // if the rmrk is "BURN" and the version is "2.0.0" or "CONSUME" for "0.1" and "1.0.0", then parse the id of the nft to burn after the ::
        if ((version === "2.0.0" && (interaction === "BURN" || interaction === "burn")) || ((version === "0.1" || version === "1.0.0") && (interaction === "CONSUME" || interaction === "consume"))) {
            rmrk = { id: rmrk_str };
            return { rmrk: rmrk, interaction: interaction, version: version };
        }
        try {
            rmrk = JSON.parse(rmrk_str);
            version = rmrk.version;
        } catch (err) {
            throw new InvalidRMRKFormat(`Encountered a rmrk (${rmrk_str}) with invalid format.`);
        }
        if (rmrk.version !== "RMRK0.1" && rmrk.version !== "rmrk0.1" && rmrk.version !== undefined)
            throw new InvalidRMRKFormat("Invalid rmrk version.");
    }

    // let rmrk = JSON.parse(rmrk_str);
    return { rmrk: rmrk, interaction: interaction, version: version };
}

// TODO check metadata formats; they should be a valid HTTP or ipfs url
// helper function that check whether the parsed rmrk follows the guidelines
function checkRmrkCollectionValid(rmrk: any) {
    return rmrk.id && rmrk.name && rmrk.max && rmrk.issuer && rmrk.symbol && rmrk.metadata;
}

function checkRmrkCollectionV2Valid(rmrk: any) {
    // TODO remove the if statement and process.exit
    // TODO also what to do with properties
    if (rmrk.properties)
        process.exit(1);
    return rmrk.id && rmrk.max && rmrk.issuer && rmrk.symbol && rmrk.metadata;
}

function checkRmrkNftValid(rmrk: any) {
    return rmrk.collection && rmrk.symbol && rmrk.transferrable && rmrk.sn && rmrk.metadata;
}
