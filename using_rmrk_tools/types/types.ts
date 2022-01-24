import { NFT } from "../../node_modules/rmrk-tools/dist-cli/src/rmrk1.0.0/classes/nft";
import { IConsolidatorAdapter } from '../../node_modules/rmrk-tools/dist-cli/src/rmrk1.0.0/tools/consolidator/adapters/types';

export type IdIndexing = {
    id_indexing_nft: number, id_indexing_collection: number
};

export interface IDBAdapterConsolidated extends IConsolidatorAdapter {
    updateNFTConsolidatedMint(nft: NFT, id_indexing: IdIndexing): Promise<any>;
}
