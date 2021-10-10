import { systemRemark } from "../../mappings/index";
import { DatabaseManager, SubstrateEvent, SubstrateBlock, SubstrateExtrinsic } from '@subsquid/hydra-common'

const store = jest.fn() as unknown as DatabaseManager;
const event = {} as unknown as SubstrateEvent;
const block = {} as unknown as SubstrateBlock;

jest.mock("@polkadot/util");

// this fixes a "Jest encountered an unexpected token" error
jest.mock("../../chain", () => jest.fn());

test("test systemRemark() v0.1", () => {
    const extrinsic = { args: [ { value: "0x1337" } ] } as unknown as SubstrateExtrinsic;

    systemRemark({store, event, block, extrinsic});
    expect(store).toHaveBeenCalledTimes(0);
});
