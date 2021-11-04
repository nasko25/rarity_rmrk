import { DatabaseManager } from '@subsquid/hydra-common'
import { Nft, Collection } from '../generated/model'

export class DBAdapter {
    store: DatabaseManager;
    constructor(store: DatabaseManager) {
        this.store = store;
    }
    async getAllNFTs() {
        // TODO not sure if valid
        return await this.store.getMany(Nft, {});
    }
    async getAllCollections() {
        return await this.store.getMany(Collection, {});
    }
    // TODO base
    // async getAllBases() {
    //     return this.bases;
    // }
    async updateNFTEmote(nft, consolidatedNFT) {
        // TODO emotes at some point
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { reactions: nft === null || nft === void 0 ? void 0 : nft.reactions });
    }
    async updateBaseEquippable(base, consolidatedBase) {
        // this.bases[consolidatedBase.id] = Object.assign(Object.assign({}, this.bases[consolidatedBase.id]), { parts: base === null || base === void 0 ? void 0 : base.parts });
    }
    async updateNFTList(nft, consolidatedNFT) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { forsale: nft === null || nft === void 0 ? void 0 : nft.forsale, changes: nft === null || nft === void 0 ? void 0 : nft.changes });
    }
    async updateEquip(nft, consolidatedNFT) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { children: nft.children });
    }
    async updateSetPriority(nft, consolidatedNFT) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { priority: nft.priority });
    }
    async updateSetAttribute(nft, consolidatedNFT) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { properties: nft.properties });
    }
    async updateNftAccept(nft, consolidatedNFT, entity) {
        // if (entity == "NFT") {
        //     this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { children: nft === null || nft === void 0 ? void 0 : nft.children, priority: (nft === null || nft === void 0 ? void 0 : nft.priority) || this.nfts[consolidatedNFT.id].priority });
        // }
        // else if (entity === "RES") {
        //     this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { resources: nft === null || nft === void 0 ? void 0 : nft.resources, priority: (nft === null || nft === void 0 ? void 0 : nft.priority) || this.nfts[consolidatedNFT.id].priority });
        // }
    }
    async updateNftResadd(nft, consolidatedNFT) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { resources: nft === null || nft === void 0 ? void 0 : nft.resources, priority: (nft === null || nft === void 0 ? void 0 : nft.priority) || this.nfts[consolidatedNFT.id].priority });
    }
    async updateNFTChildrenRootOwner(nft, rootowner, level) {
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
    async updateNFTBuy(nft, consolidatedNFT) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { owner: nft === null || nft === void 0 ? void 0 : nft.owner, rootowner: nft === null || nft === void 0 ? void 0 : nft.rootowner, changes: nft === null || nft === void 0 ? void 0 : nft.changes, forsale: nft === null || nft === void 0 ? void 0 : nft.forsale });
    }
    async updateNFTSend(nft, consolidatedNFT) {
        // this.nfts[consolidatedNFT.id] = Object.assign(Object.assign({}, this.nfts[consolidatedNFT.id]), { changes: nft === null || nft === void 0 ? void 0 : nft.changes, owner: nft === null || nft === void 0 ? void 0 : nft.owner, rootowner: nft === null || nft === void 0 ? void 0 : nft.rootowner, forsale: BigInt(0), pending: nft === null || nft === void 0 ? void 0 : nft.pending });
    }
    async updateNFTBurn(nft, consolidatedNFT) {
        this.store.get(Nft, {where: {id: consolidatedNFT.id}}).then(nft => {
            this.store.remove(nft);
        });
    }
    async updateNFTMint(nft) {
        // TODO types?
        this.store.save(nft);
    }
    async updateCollectionMint(collection) {
        this.store.save(collection);
    }
    async updateBase(base) {
        // return (this.bases[base.getId()] = Object.assign(Object.assign({}, base), { id: base.getId() }));
    }
    async updateBaseThemeAdd(base, consolidatedBase) {
        // this.bases[consolidatedBase.id] = Object.assign(Object.assign({}, this.bases[consolidatedBase.id]), { themes: base === null || base === void 0 ? void 0 : base.themes });
    }
    async updateCollectionIssuer(collection, consolidatedCollection) {
        this.store.get(Collection, {where: {id: consolidatedCollection.id}}).then(collectionFromDb => {
            this.store.remove(collectionFromDb);
            collectionFromDb.issuer = collection === null || collection === void 0 ? void 0 : collection.issuer;
            this.store.save(collectionFromDb);

        });
        // this.collections[consolidatedCollection.id] = Object.assign(Object.assign({}, this.collections[consolidatedCollection.id]), { issuer: collection === null || collection === void 0 ? void 0 : collection.issuer, changes: collection === null || collection === void 0 ? void 0 : collection.changes });
    }
    async updateBaseIssuer(base, consolidatedBase) {
        // this.bases[consolidatedBase.id] = Object.assign(Object.assign({}, this.bases[consolidatedBase.id]), { issuer: base === null || base === void 0 ? void 0 : base.issuer, changes: base === null || base === void 0 ? void 0 : base.changes });
    }
    async getNFTById(id) {
        return await this.store.get(Nft, {where: {id: id}});
        // return this.nfts[id];
    }
    async getCollectionById(id) {
        return await this.store.get(Collection, {where: {id: id}});
    }
    /**
     * Find existing NFT by id
     */
    async getNFTByIdUnique(id) {
        return await this.store.get(Nft, {where: {id: id}});
        // return this.nfts[id];
    }
    async getBaseById(id) {
        // return this.bases[id];
    }
}
//# sourceMappingURL=in-memory-adapter.js.map