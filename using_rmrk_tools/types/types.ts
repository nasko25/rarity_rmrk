import { NFT } from "../../node_modules/rmrk-tools/dist-cli/src/rmrk1.0.0/classes/nft";
import { NFT as NFTv2 } from "rmrk-tools/dist/classes/nft";
import { IConsolidatorAdapter } from '../../node_modules/rmrk-tools/dist-cli/src/rmrk1.0.0/tools/consolidator/adapters/types';
import { CollectionConsolidated } from "../../node_modules/rmrk-tools/dist-cli/src/rmrk1.0.0/tools/consolidator/consolidator";
import { CollectionConsolidated as CollectionConsolidatedV2 } from "rmrk-tools/dist/tools/consolidator/consolidator";
import { IConsolidatorAdapter as IConsolidatorAdapterV2 } from "../../node_modules/rmrk-tools/dist/tools/consolidator/adapters/types";

export type IdIndexing = {
    id_indexing_nft: number, id_indexing_collection: number
};

export interface IDBAdapterConsolidated extends IConsolidatorAdapter {
    updateNFTConsolidatedMint(nft: NFT, id_indexing: IdIndexing): Promise<any>;
    updateCollectionConsolidatedMint(collection: CollectionConsolidated, id_indexing: IdIndexing): Promise<any>;
}

export interface IDBAdapterConsolidatedV2 extends IConsolidatorAdapterV2 {
    updateNFTConsolidatedMint(nft: NFTv2, id_indexing: IdIndexing): Promise<any>;
    updateCollectionConsolidatedMint(collection: CollectionConsolidatedV2, id_indexing: IdIndexing): Promise<any>;
}
