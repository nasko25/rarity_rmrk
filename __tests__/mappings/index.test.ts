import { systemRemark } from "../../mappings/index";
import { DatabaseManager, SubstrateEvent, SubstrateBlock, SubstrateExtrinsic } from '@subsquid/hydra-common'
import { Nft } from "../../generated/model";
import BN from 'bn.js'

const store = { save: jest.fn() } as unknown as DatabaseManager;
const event = {} as unknown as SubstrateEvent;
const block = {} as unknown as SubstrateBlock;

jest.mock("@polkadot/util");

// this fixes a "Jest encountered an unexpected token" error
jest.mock("../../chain", () => jest.fn());

afterEach(() => {
    jest.clearAllMocks();
});

test("test systemRemark() for system.remarks that are not rmrks", async () => {
    const value = "0x1337";
    const extrinsic = { args: [ { value: value } ] } as unknown as SubstrateExtrinsic;

    let spyToString = jest.spyOn(String.prototype, "toString");
    let spyStartsWith = jest.spyOn(String.prototype, "startsWith");
    await systemRemark({store, event, block, extrinsic});
    expect(store.save).toHaveBeenCalledTimes(0);
    expect(spyToString).toHaveBeenCalledTimes(2);
    expect(spyStartsWith).toHaveBeenCalledTimes(2);
    expect(spyStartsWith).toHaveBeenNthCalledWith(1, "0x726d726b");
    expect(spyStartsWith).toHaveBeenNthCalledWith(2, "0x524d524c");
    expect(spyToString.mock.instances[0]).toBe(value);      // or toEqual() ?
    expect(spyToString.mock.instances[1]).toBe(value);      // or toEqual() ?

    spyToString.mockRestore();
    spyStartsWith.mockRestore();
});

describe("rmrkv0.1", () => {
    test("test systemRemark() for rmrk0.1", async () => {
        const value = "0x" + Buffer.from("rmrk::MINT::%7B%22version%22%3A%22RMRK0.1%22%2C%22name%22%3A%22Dot+Leap+Early+Promoters%22%2C%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22id%22%3A%220aff6865bed3a66b-DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D").toString("hex");
        const extrinsic = { args: [ { value: value } ] } as unknown as SubstrateExtrinsic;

        // TODO remove when systemRemark() is done and no longer ends the process
        const exit = process.exit;
        process.exit = jest.fn() as never;

        await systemRemark({store, event, block, extrinsic});
        expect(store.save).toHaveBeenCalledTimes(1);
        // TODO should come from `value`; fix it when systemRemark() works as expected
        // TODO add Collection entity
        const nft = new Nft();
        nft.collection = "test";
        nft.metadata = "https://asdf.com";
        nft.sn = "10";
        nft.symbol = "T";
        nft.transferrable = new BN(1000);
        expect(store.save).toHaveBeenNthCalledWith(1, nft);

        process.exit = exit;
    });

    test("test systemRemark() for an invalid rmrk0.1 input", async () => {
        const extrinsicNoValue = { args: [ { } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsicNoValue});
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);

        const extrinsicEmptyArgs = { args: [ ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsicEmptyArgs});
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);

        const extrinsicNoArgs = { } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsicNoArgs});
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);
    });
});
