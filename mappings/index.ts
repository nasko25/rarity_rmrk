import BN from 'bn.js'
import { DatabaseManager, EventContext, StoreContext, AnyJsonField } from '@subsquid/hydra-common'
import { Account, HistoricalBalance, Nft, Collection } from '../generated/model'
import { Balances } from '../chain'
import { hexToString, stringToHex } from "@polkadot/util";


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
    // nft remarks should start with starts with rmrk or RMRK
    if (ext_val?.toString().startsWith("0x726d726b") || ext_val?.toString().startsWith("0x524d524c")) {
        console.log("rmrk encountered\n");
        try {
            console.log(JSON.stringify(parse_rmrk(ext_val)) + "\n");
        } catch (err) {
            console.error(err);
            return;
        }
        let nft = new Nft();
        nft.collection = "test";
        nft.symbol = "T";
        let bn = new BN(1000);
        nft.transferrable = bn;
        nft.sn = "10";
        nft.metadata = "https://asdf.com";
        await store.save(nft)

        // TODO remove:
        process.exit(1);
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
    ["1.0.0", rmrk_v1_handler],
    ["2.0.0", rmrk_v2_handler],
]);

// errors
class InvalidInteraction extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "InvalidInteraction";
    }
}

class InvalidRMRKFormat extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "InvalidInteraction";
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
        try {
            rmrk = JSON.parse(rmrk_str);
        } catch (err) {
            throw new InvalidRMRKFormat(`Encountered a rmrk (${rmrk_str}) with invalid format.`);
        }
        if (rmrk.version !== "RMRK0.1" && rmrk.version !== "rmrk0.1")
            throw new InvalidRMRKFormat("Invalid rmrk version.");
    }

    // let rmrk = JSON.parse(rmrk_str);
    return rmrk;
}
