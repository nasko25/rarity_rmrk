import { systemRemark } from "../../mappings/index";
import { DatabaseManager, SubstrateEvent, SubstrateBlock, SubstrateExtrinsic } from '@subsquid/hydra-common'

const store = jest.fn() as unknown as DatabaseManager;
const event = {} as unknown as SubstrateEvent;
const block = {} as unknown as SubstrateBlock;

jest.mock("@polkadot/util");

// this fixes a "Jest encountered an unexpected token" error
jest.mock("../../chain", () => jest.fn());

test("test systemRemark() v0.1", () => {
    const value = "0x1337";
    const extrinsic = { args: [ { value: value } ] } as unknown as SubstrateExtrinsic;

    let spyToString = jest.spyOn(String.prototype, "toString");
    let spyStartsWith = jest.spyOn(String.prototype, "startsWith");
    systemRemark({store, event, block, extrinsic});
    expect(store).toHaveBeenCalledTimes(0);
    expect(spyToString).toHaveBeenCalledTimes(2);
    expect(spyStartsWith).toHaveBeenCalledTimes(2);
    expect(spyStartsWith).toHaveBeenNthCalledWith(1, "0x726d726b");
    expect(spyStartsWith).toHaveBeenNthCalledWith(2, "0x524d524c");
    expect(spyToString.mock.instances[0]).toBe(value);      // or toEqual() ?
    expect(spyToString.mock.instances[1]).toBe(value);      // or toEqual() ?

    spyToString.mockRestore();
    spyStartsWith.mockRestore();
});
