import BN from 'bn.js'
import { DatabaseManager, EventContext, StoreContext } from '@subsquid/hydra-common'
import { Account, HistoricalBalance, Nft } from '../generated/model'
import { Balances } from '../chain'


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

export async function systemRemark({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {

    let ext_val = extrinsic?.args[0].value;
    // nft remarks should start with starts with rmrk or RMRK
    if (ext_val?.toString().startsWith("0x726d726b") || ext_val?.toString().startsWith("0x524d524c")) {
        console.log("rmrk encountered.", event.params[0].value, extrinsic?.args[0].value)
        let nft = new Nft();
        nft.collection = "test";
        nft.symbol = "T";
        let bn = new BN(1000);
        nft.transferrable = bn;
        nft.sn = "10";
        nft.metadata = "https://asdf.com";
        await store.save(nft)
        process.exit(1);
    }
}

async function parse_rmrk(ext_val: Number) {
    // TODO
}
