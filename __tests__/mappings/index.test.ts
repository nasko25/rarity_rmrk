import { systemRemark, InvalidInteraction } from "../../mappings/index";
import { DatabaseManager, SubstrateEvent, SubstrateBlock, SubstrateExtrinsic } from '@subsquid/hydra-common'
import { Collection, Nft } from "../../generated/model";
import BN from 'bn.js'

const store = { save: jest.fn() } as unknown as DatabaseManager;
const event = {} as unknown as SubstrateEvent;
const block = {} as unknown as SubstrateBlock;

jest.mock("@polkadot/util");

// this fixes a "Jest encountered an unexpected token" error
jest.mock("../../chain", () => jest.fn());

// TODO mock console.error

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

// TODO test for different versions
describe("rmrkv0.1", () => {
    test("test systemRemark() for rmrk0.1", async () => {
        const value = "0x" + Buffer.from("rmrk::MINT::%7B%22version%22%3A%22RMRK0.1%22%2C%22name%22%3A%22Dot+Leap+Early+Promoters%22%2C%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22id%22%3A%220aff6865bed3a66b-DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D").toString("hex");
        const extrinsic = { args: [ { value: value } ] } as unknown as SubstrateExtrinsic;

        await systemRemark({store, event, block, extrinsic});
        expect(store.save).toHaveBeenCalledTimes(1);
        const collection = new Collection();
        collection.id = "0aff6865bed3a66b-DLEP";
        collection.name = "Dot Leap Early Promoters";
        collection.max = new BN(100);
        collection.issuer = "CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp";
        collection.symbol = "DLEP";
        collection.metadata = "ipfs://ipfs/QmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j";
        expect(store.save).toHaveBeenNthCalledWith(1, collection);
    });

    test("test systemRemark() for an invalid rmrk0.1 input", async () => {
        const console_error = console.error;
        console.error = jest.fn();

        const extrinsicNoValue = { args: [ { } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsicNoValue});
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenCalledTimes(0);

        const extrinsicEmptyArgs = { args: [ ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsicEmptyArgs});
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenNthCalledWith(1, "Unexpected extrinsic format.");

        const extrinsicNoArgs = { } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsicNoArgs});
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenNthCalledWith(2, "Unexpected extrinsic format.");

                                                                                              // , missing here
        const valueInvalidJson = "0x" + Buffer.from("rmrk::MINT::%7B%22version%22%3A%22RMRK0.1%22%22name%22%3A%22Dot+Leap+Early+Promoters%22%2C%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22id%22%3A%220aff6865bed3a66b-DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D").toString("hex");
        const extrinsic_valueInvalidJson = { args: [ { value: valueInvalidJson } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsic_valueInvalidJson });
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenNthCalledWith(3, new InvalidInteraction(`Encountered a rmrk ({"version":"RMRK0.1""name":"Dot Leap Early Promoters","max":100,"issuer":"CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp","symbol":"DLEP","id":"0aff6865bed3a66b-DLEP","metadata":"ipfs://ipfs/QmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j"}) with invalid format.`));

                                                                                                      // ,  ,
        const valueInvalidJson2commas = "0x" + Buffer.from("rmrk::MINT::%7B%22version%22%3A%22RMRK0.1%22%2C%2C%22name%22%3A%22Dot+Leap+Early+Promoters%22%2C%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22id%22%3A%220aff6865bed3a66b-DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D").toString("hex");
        const extrinsic_valueInvalidJson2commas = { args: [ { value: valueInvalidJson2commas } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsic_valueInvalidJson2commas });
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenNthCalledWith(4, new InvalidInteraction(`Encountered a rmrk ({"version":"RMRK0.1",,"name":"Dot Leap Early Promoters","max":100,"issuer":"CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp","symbol":"DLEP","id":"0aff6865bed3a66b-DLEP","metadata":"ipfs://ipfs/QmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j"}) with invalid format.`));

        const valueNotStartingWith0x = Buffer.from("rmrk::MINT::%7B%22version%22%3A%22RMRK0.1%22%2C%22name%22%3A%22Dot+Leap+Early+Promoters%22%2C%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22id%22%3A%220aff6865bed3a66b-DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D").toString("hex");
        const extrinsic_valueNotStartingWith0x = { args: [ { value: valueNotStartingWith0x } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsic_valueNotStartingWith0x });
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);
        // the parsing of this this should not call an error, so the amount of console.error calls should be the same
        expect(console.error).toHaveBeenCalledTimes(4);

        // TODO try that for everything missing?
        // TODO can a collection have a missing name, id, etc. ?
        const valueWithoutName = "0x" + Buffer.from("rmrk::MINT::%7B%22version%22%3A%22RMRK0.1%22%2C%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22id%22%3A%220aff6865bed3a66b-DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D").toString("hex");
        const extrinsic_valueWithoutName = { args: [ { value: valueWithoutName } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsic_valueWithoutName });
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenNthCalledWith(5, "Collection \"undefined\" is not following rmrk guidelines, so it cannot be parsed.");

        // const valueWithoutVersionAndWithoutName = TODO;  should be invalid

        const valueWithoutId = "0x" + Buffer.from("rmrk::MINT::%7B%22version%22%3A%22RMRK0.1%22%2C%22name%22%3A%22Dot+Leap+Early+Promoters%22%2C%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D").toString("hex");
        const extrinsic_valueWithoutId = { args: [ { value: valueWithoutId } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsic_valueWithoutId });
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenNthCalledWith(6, "Collection \"Dot Leap Early Promoters\" is not following rmrk guidelines, so it cannot be parsed.");

        expect(console.error).toHaveBeenCalledTimes(6);

        // restore console.error to the saved value
        console.error = console_error;
    });

    // this is a known bug
    // https://github.com/rmrk-team/rmrk-spec/tree/master/standards/rmrk0.1#known-issues
    // version 0.1 should be assumed when version is not specified for MINT and MINTNFT operations
    test("test systemRemark() for rmrk0.1 with missing version", async () => {
        const valueWithoutVersion = "0x" + Buffer.from("rmrk::MINT::%7B%22name%22%3A%22Dot+Leap+Early+Promoters%22%2C%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22id%22%3A%220aff6865bed3a66b-DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D").toString("hex");
        const extrinsic_valueMissingVersion = { args: [ { value: valueWithoutVersion } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic: extrinsic_valueMissingVersion });
        // nothing should be saved on invalid input
        expect(store.save).toHaveBeenCalledTimes(1);

        const collection = new Collection();
        collection.id = "0aff6865bed3a66b-DLEP";
        collection.name = "Dot Leap Early Promoters";
        collection.max = new BN(100);
        collection.issuer = "CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp";
        collection.symbol = "DLEP";
        collection.metadata = "ipfs://ipfs/QmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j";

        expect(store.save).toHaveBeenNthCalledWith(1, collection);
    });
});

describe("rmrk v2.0.0", () => {
    test("test minting an collection with a missing id", async () => {
        const value = "0x" + Buffer.from("rmrk::CREATE::2.0.0::%7B%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D").toString("hex");

        const console_error = console.error;
        console.error = jest.fn();

        const extrinsic = { args: [ { value: value } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic});
        expect(store.save).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenNthCalledWith(1, "Collection \"undefined\" is not following rmrk guidelines, so it cannot be parsed.");

        console.error = console_error;
    });
    test("test minting a collection", async () => {
        const value = "0x" + Buffer.from("rmrk::CREATE::2.0.0::%7B%22max%22%3A100%2C%22issuer%22%3A%22CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp%22%2C%22symbol%22%3A%22DLEP%22%2C%22id%22%3A%220aff6865bed3a66b-DLEP%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j%22%7D").toString("hex");

        const extrinsic = { args: [ { value: value } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic});
        expect(store.save).toHaveBeenCalledTimes(1);

        const collection = new Collection();
        collection.id = "0aff6865bed3a66b-DLEP";
        collection.max = new BN(100);
        collection.issuer = "CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp";
        collection.symbol = "DLEP";
        collection.metadata = "ipfs://ipfs/QmVgs8P4awhZpFXhkkgnCwBp4AdKRj3F9K58mCZ6fxvn3j";

        expect(store.save).toHaveBeenNthCalledWith(1, collection);
    });
    test("test minting an nft", async () => {
        const value = "0x" + Buffer.from("rmrk::MINT::2.0.0::%7B%22collection%22%3A%220aff6865bed3a66b-DLEP%22%2C%22symbol%22%3A%22DL15%22%2C%22transferable%22%3A1%2C%22sn%22%3A%2200000001%22%2C%22metadata%22%3A%22ipfs%3A%2F%2Fipfs%2FQmavoTVbVHnGEUztnBT2p3rif3qBPeCfyyUE5v4Z7oFvs4%22%7D").toString("hex");

        const extrinsic = { args: [ { value: value } ] } as unknown as SubstrateExtrinsic;
        await systemRemark({store, event, block, extrinsic});
        expect(store.save).toHaveBeenCalledTimes(1);

        const nft = new Nft();
        nft.collection = "0aff6865bed3a66b-DLEP";
        nft.symbol = "DL15";
        nft.transferable = new BN(1);
        nft.sn = "00000001";
        nft.metadata = "ipfs://ipfs/QmavoTVbVHnGEUztnBT2p3rif3qBPeCfyyUE5v4Z7oFvs4";

        expect(store.save).toHaveBeenNthCalledWith(1, nft);
    });
    test("test burning an nft", async () => {
        const collection = "0aff6865bed3a66b-VALHELLO";
        const sn = "00000001";
        const name = "POTION_HEAL";
        const burn = "0x" + Buffer.from(`rmrk::BURN::2.0.0::5105000-${collection}-${name}-${sn}`).toString("hex");

        const extrinsicBurn = { args: [ { value: burn } ] } as unknown as SubstrateExtrinsic;

        // the nft that needs to be burned
        const nft = new Nft();
        nft.collection = "0aff6865bed3a66b-VALHELLO";
        nft.symbol = "VH15";
        nft.transferable = new BN(1);
        nft.sn = "00000001";
        nft.metadata = "ipfs://ipfs/QmavoTVbVHnGEUztnBT2p3rif3qBPeCfyyUE5v4Z7oFvs4";

        store.findOne = jest.fn().mockImplementationOnce(rmrk => {
            expect(rmrk.collection === collection && rmrk.sn === sn);
            return nft;
        });

        await systemRemark({store, event, block, extrinsic: extrinsicBurn});
        expect(store.save).toHaveBeenCalledTimes(0);
        expect(store.remove).toHaveBeenCalledTimes(1);
        expect(store.remove).toHaveBeenNthCalledWith(1, nft);
    });
});
