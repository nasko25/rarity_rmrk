import { DatabaseManager } from '@subsquid/hydra-common'
import { Nft, Collection } from '../generated/model'
import { IConsolidatorAdapter } from "rmrk-tools/dist/tools/consolidator/adapters/types";
import { NFTConsolidated, CollectionConsolidated, BaseConsolidated } from "rmrk-tools/dist/tools/consolidator/consolidator";
import { NFT } from "rmrk-tools/dist/classes/nft";
import { Collection as CollectionDist } from "rmrk-tools/dist/classes/collection";
import { Base } from 'rmrk-tools';
import { AcceptEntityType } from 'rmrk-tools/dist/classes/accept';
import BN from 'bn.js'

export class DBAdapter implements IConsolidatorAdapter {
    store: DatabaseManager;
    constructor(store: DatabaseManager) {
        this.store = store;
    }
    async getAllNFTs() {
        // TODO not sure if valid
        return await this.store.getMany(Nft, {}).then(nfts => { return nfts.map(nft => { return {id: nft.id, nft: nft as unknown as NFTConsolidated }}) as unknown as Record<string, NFTConsolidated>});
    }
    async getAllCollections() {
        return await this.store.getMany(Collection, {}).then(collections => { return collections.map(collection => { return {id: collection.id, collection: collection as unknown as CollectionConsolidated } }) as unknown as Record<string, CollectionConsolidated> });
    }
    // TODO base
    async getAllBases() {
    //     return this.bases;
        return {} as Record<string, BaseConsolidated>;
    }
    async updateNFTEmote(nft: NFT, consolidatedNFT: NFTConsolidated) {
        // TODO emotes at some point
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { reactions: nft === null || nft === void 0 ? void 0 : nft.reactions });
    }
    async updateBaseEquippable(base: Base, consolidatedBase: BaseConsolidated) {
        // this.bases[consolidatedBase.id] = Object.assign(Object.assign({}, this.bases[consolidatedBase.id]), { parts: base === null || base === void 0 ? void 0 : base.parts });
    }
    async updateNFTList(nft: NFT, consolidatedNFT: NFTConsolidated) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { forsale: nft === null || nft === void 0 ? void 0 : nft.forsale, changes: nft === null || nft === void 0 ? void 0 : nft.changes });
    }
    async updateEquip(nft: NFT, consolidatedNFT: NFTConsolidated) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { children: nft.children });
    }
    async updateSetPriority(nft: NFT, consolidatedNFT: NFTConsolidated) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { priority: nft.priority });
    }
    async updateSetAttribute(nft: NFT, consolidatedNFT: NFTConsolidated) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { properties: nft.properties });
    }
    async updateNftAccept(nft: NFT, consolidatedNFT: NFTConsolidated, entity: AcceptEntityType) {
        // if (entity == "NFT") {
        //     this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { children: nft === null || nft === void 0 ? void 0 : nft.children, priority: (nft === null || nft === void 0 ? void 0 : nft.priority) || this.nfts[consolidatedNFT.id].priority });
        // }
        // else if (entity === "RES") {
        //     this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { resources: nft === null || nft === void 0 ? void 0 : nft.resources, priority: (nft === null || nft === void 0 ? void 0 : nft.priority) || this.nfts[consolidatedNFT.id].priority });
        // }
    }
    async updateNftResadd(nft: NFT, consolidatedNFT: NFTConsolidated) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { resources: nft === null || nft === void 0 ? void 0 : nft.resources, priority: (nft === null || nft === void 0 ? void 0 : nft.priority) || this.nfts[consolidatedNFT.id].priority });
    }
    async updateNFTChildrenRootOwner(nft: NFT) {
        // if ((level || 1) < 10 && nft.children && nft.children.length > 0) {
        //     const promises = nft.children.map(async (child) => {
        //         var _a, _b;
        //         if (((_a = this.nfts[child.id]) === null || _a === void 0 ? void 0 : _a.children) &&
        //             ((_b = this.nfts[child.id]) === null || _b === void 0 ? void 0 : _b.children.length) > 0) {
        //             await this.updateNFTChildrenRootOwner(this.nfts[child.id], rootowner || nft.rootowner, (level || 1) + 1);
        //         }
        //         this.nfts[child.id] = Object.assign(Object.assign({}, this.nfts[child.id]), { forsale: BigInt(0), rootowner: rootowner || nft.rootowner });
        //     });
        //     await Promise.all(promises);
        // }
    }
    async updateNFTBuy(nft: NFT, consolidatedNFT: NFTConsolidated) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { owner: nft === null || nft === void 0 ? void 0 : nft.owner, rootowner: nft === null || nft === void 0 ? void 0 : nft.rootowner, changes: nft === null || nft === void 0 ? void 0 : nft.changes, forsale: nft === null || nft === void 0 ? void 0 : nft.forsale });
    }
    async updateNFTSend(nft: NFT, consolidatedNFT: NFTConsolidated) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { changes: nft === null || nft === void 0 ? void 0 : nft.changes, owner: nft === null || nft === void 0 ? void 0 : nft.owner, rootowner: nft === null || nft === void 0 ? void 0 : nft.rootowner, forsale: BigInt(0), pending: nft === null || nft === void 0 ? void 0 : nft.pending });
    }
    async updateNFTBurn(nft: NFT | NFTConsolidated, consolidatedNFT: NFTConsolidated) {
        await this.store.get(Nft, {where: {id: consolidatedNFT.id}}).then(async nft => {
            if (nft)
                await this.store.remove(nft);
            else
                console.error(`Nft with id ${consolidatedNFT.id} is undefined and cannot be burned.`);
        });
    }
    async updateNFTMint(nft: NFT) {
        const nftToAdd = new Nft();
        nftToAdd.id = nft.getId();
        nftToAdd.collection = nft.collection;
        nftToAdd.symbol = nft.symbol;
        nftToAdd.transferable = new BN(nft.transferable);
        nftToAdd.sn = nft.sn;
        nftToAdd.metadata = nft.metadata;
        nftToAdd.block = new BN(nft.block);
        await this.store.save<Nft>(nftToAdd);
    }
    async updateCollectionMint(collection: CollectionConsolidated) {
        // TODO this is how this.store methods should be called
        let collectionToAdd = new Collection();
        collectionToAdd.block = new BN(collection.block);
        collectionToAdd.id = collection.id;
        collectionToAdd.issuer = collection.issuer;
        collectionToAdd.metadata = collection.metadata;
        collectionToAdd.symbol = collection.symbol;
        collectionToAdd.max = new BN(collection.max);
        await this.store.save<Collection>(collectionToAdd);
    }
    async updateBase(base: Base) {
        // return (this.bases[base.getId()] = Object.assign(Object.assign({}, base), { id: base.getId() }));
    }
    async updateBaseThemeAdd(base: Base, consolidatedBase: BaseConsolidated) {
        // this.bases[consolidatedBase.id] = Object.assign(Object.assign({}, this.bases[consolidatedBase.id]), { themes: base === null || base === void 0 ? void 0 : base.themes });
    }
    async updateCollectionIssuer(collection: CollectionDist, consolidatedCollection: CollectionConsolidated) {
        await this.store.get(Collection, {where: {id: consolidatedCollection.id}}).then(async collectionFromDb => {
            // if the collection exists in the db, remove it and add it again with the new issuer
            if(collectionFromDb) {
                await this.store.remove(collectionFromDb);
                collectionFromDb.issuer = collection === null || collection === void 0 ? void 0 : collection.issuer;
                await this.store.save(collectionFromDb);
            }
            // otherwise just add the given collection to the db
            else {
                console.error(`Collection with id ${consolidatedCollection.id} is undefined in the db.`);
                let collectionToAdd = new Collection();
                collectionToAdd.block = new BN(collection.block);
                collectionToAdd.id = collection.id;
                collectionToAdd.issuer = collection.issuer;
                collectionToAdd.metadata = collection.metadata;
                collectionToAdd.symbol = collection.symbol;
                collectionToAdd.max = new BN(collection.max);

                await this.store.save(collectionToAdd);
            }
        });
        // this.collections[consolidatedCollection.id] = Object.assign(Object.assign({}, this.collections[consolidatedCollection.id]), { issuer: collection === null || collection === void 0 ? void 0 : collection.issuer, changes: collection === null || collection === void 0 ? void 0 : collection.changes });
    }
    async updateBaseIssuer(base: Base, consolidatedBase: BaseConsolidated) {
        // this.bases[consolidatedBase.id] = Object.assign(Object.assign({}, this.bases[consolidatedBase.id]), { issuer: base === null || base === void 0 ? void 0 : base.issuer, changes: base === null || base === void 0 ? void 0 : base.changes });
    }
    async getNFTById(id: string) {
        return await this.store.get(Nft, {where: {id: id}}).then(nft => { return nft as unknown as NFTConsolidated });
        // return this.nfts[id];
    }
    async getCollectionById(id: string) {
        return await this.store.get(Collection, {where: {id: id}}).then(collection => { return collection as unknown as CollectionConsolidated });
    }
    /**
     * Find existing NFT by id
     */
    async getNFTByIdUnique(id: string) {
        return await this.store.get(Nft, {where: {id: id}}).then(nft => { return nft as unknown as NFTConsolidated });
        // return this.nfts[id];
    }
    async getBaseById(id: string) {
        // return this.bases[id];
        return undefined;
    }
}
//# sourceMappingURL=in-memory-adapter.js.map
