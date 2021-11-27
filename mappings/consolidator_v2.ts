import { IConsolidatorAdapter } from "../node_modules/rmrk-tools/dist-cli/src/rmrk2.0.0/tools/consolidator/adapters/types";
import { Collection, Base, NFT, getCollectionFromRemark, validateCreateIds, consolidatedCollectionToInstance,
    invalidateIfRecursion, validateMintNFT, Send, consolidatedNFTtoInstance, sendInteraction, List,
    isValidAddressPolkadotAddress } from "../node_modules/rmrk-tools/dist-cli/src/rmrk2.0.0";
import { getBaseFromRemark } from "../node_modules/rmrk-tools/dist-cli/src/rmrk2.0.0/tools/consolidator/interactions/base";
import { InMemoryAdapter } from "../node_modules/rmrk-tools/dist-cli/src/rmrk2.0.0/tools/consolidator/adapters/in-memory-adapter";
import { Remark } from "../node_modules/rmrk-tools/dist-cli/src/rmrk2.0.0/tools/consolidator/remark";

// code taken from node_modules/rmrk-tools in order to debug it
type InvalidCall = {
    message: string;
    caller: string;
    block: number;
    object_id: string;
    op_type: string;
};

                                                                                                // not sure for this return type
const invalidateIfParentIsForsale = async (nftId: string, dbAdapter: IConsolidatorAdapter, level = 1): Promise<boolean> => {
    if (!nftId) {
        throw new Error("invalidateIfParentIsForsale NFT id is missing");
    }
    if (level > 10) {
        throw new Error("Trying to invalidateIfParentIsForsale too deep, possible stack overflow");
    }
    if (isValidAddressPolkadotAddress(nftId)) {
        return true;
    }
    else {
        const consolidatedNFT = await dbAdapter.getNFTByIdUnique(nftId);
        const nft = consolidatedNFTtoInstance(consolidatedNFT);
        if (!nft) {
            // skip
            return true;
        }
        if (nft.forsale > BigInt(0)) {
            throw new Error(`Attempting to do something with an NFT who's parent ${nft.getId()} is listed for sale`);
        }
        // Bubble up until owner of nft is polkadot address
        return await invalidateIfParentIsForsale(nft.owner, dbAdapter, level + 1);
    }
};

enum OP_TYPES {
    BUY = "BUY",
    LIST = "LIST",
    CREATE = "CREATE",
    MINT = "MINT",
    SEND = "SEND",
    EMOTE = "EMOTE",
    CHANGEISSUER = "CHANGEISSUER",
    BURN = "BURN",
    BASE = "BASE",
    EQUIPPABLE = "EQUIPPABLE",
    THEMEADD = "THEMEADD",
    RESADD = "RESADD",
    ACCEPT = "ACCEPT",
    EQUIP = "EQUIP",
    SETPROPERTY = "SETPROPERTY",
    LOCK = "LOCK",
    SETPRIORITY = "SETPRIORITY"
}

type InteractionChanges = Partial<Record<OP_TYPES, string>>[];

class Consolidator {
    readonly invalidCalls: InvalidCall[];
    readonly collections: Collection[];
    readonly bases: Base[];
    readonly nfts: NFT[];
    readonly dbAdapter: IConsolidatorAdapter;
    readonly ss58Format?: number;
    readonly emitEmoteChanges?: boolean;
    readonly emitInteractionChanges?: boolean;
    private interactionChanges: InteractionChanges;
    /**
     * @param ss58Format
     * @param dbAdapter
     * @param emitEmoteChanges log EMOTE events in nft 'changes' prop
     * @param emitInteractionChanges return interactions changes ( OP_TYPE: id )
     */
    constructor(ss58Format: number, dbAdapter: IConsolidatorAdapter, emitEmoteChanges: boolean, emitInteractionChanges: boolean) {
        this.interactionChanges = [];
        if (ss58Format) {
            this.ss58Format = ss58Format;
        }
        this.emitEmoteChanges = emitEmoteChanges || false;
        this.emitInteractionChanges = emitInteractionChanges || false;
        this.dbAdapter = dbAdapter || new InMemoryAdapter();
        this.invalidCalls = [];
        this.collections = [];
        this.nfts = [];
        this.bases = [];
    }
    updateInvalidCalls(op_type: string, remark: Remark) {
        const invalidCallBase = {
            op_type,
            block: remark.block,
            caller: remark.caller,
        };
        return function update(this: any, object_id: any, message: any) {
            this.invalidCalls.push(Object.assign(Object.assign({}, invalidCallBase), { object_id,
                message }));
        };
    }
    /**
     * The BASE interaction creates a BASE entity.
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/base.md
     */
    async base(remark: Remark) {
        const invalidate = this.updateInvalidCalls(OP_TYPES.BASE, remark).bind(this);
        let base;
        try {
            base = getBaseFromRemark(remark);
        }
        catch (e: any) {
            invalidate(remark.remark, e.message);
            return true;
        }
        const existingBase = await this.dbAdapter.getBaseById(base.getId());
        if (existingBase) {
            invalidate(base.getId(), `[${OP_TYPES.BASE}] Attempt to create already existing base`);
            return true;
        }
        try {
            await this.dbAdapter.updateBase(base);
            this.bases.push(base);
            if (this.emitInteractionChanges) {
                this.interactionChanges.push({ [OP_TYPES.BASE]: base.getId() });
            }
        }
        catch (e: any) {
            invalidate(base.getId(), e.message);
            return true;
        }
        return false;
    }
    /**
     * The CREATE interaction creates a NFT class.
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/create.md
     */
    async create(remark: Remark) {
        const invalidate = this.updateInvalidCalls(OP_TYPES.CREATE, remark).bind(this);
        let collection;
        try {
            collection = getCollectionFromRemark(remark);
        }
        catch (e: any) {
            invalidate(remark.remark, e.message);
            return true;
        }
        const existingCollection = await this.dbAdapter.getCollectionById(collection.id);
        if (existingCollection) {
            invalidate(collection.id, `[${OP_TYPES.CREATE}] Attempt to create already existing collection`);
            return true;
        }
        try {
            validateCreateIds(collection, remark);
            await this.dbAdapter.updateCollectionMint(collection);
            this.collections.push(collection);
            if (this.emitInteractionChanges) {
                this.interactionChanges.push({ [OP_TYPES.CREATE]: collection.id });
            }
        }
        catch (e: any) {
            invalidate(collection.id, e.message);
            return true;
        }
        return false;
    }
    /**
     * The MINT interaction creates an NFT inside of a Collection.
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/mint.md
     */
    async mint(remark: Remark) {
        const invalidate = this.updateInvalidCalls(OP_TYPES.MINT, remark).bind(this);
        const nft = NFT.fromRemark(remark.remark, remark.block);
        if (typeof nft === "string") {
            invalidate(remark.remark, `[${OP_TYPES.MINT}] Dead before instantiation: ${nft}`);
            return true;
        }
        const exists = await this.dbAdapter.getNFTByIdUnique(nft.getId());
        if (exists) {
            invalidate(nft.getId(), `[${OP_TYPES.MINT}] Attempt to mint already existing NFT`);
            return true;
        }
        const nftParentCollection = await this.dbAdapter.getCollectionById(nft.collection);
        const collection = nftParentCollection
            ? consolidatedCollectionToInstance(nftParentCollection)
            : undefined;
        try {
            if (nft.getId()) {
                await invalidateIfRecursion(nft.getId(), nft.owner, this.dbAdapter);
            }
            await validateMintNFT(remark, nft, this.dbAdapter, collection);
            await this.dbAdapter.updateNFTMint(nft);
            this.nfts.push(nft);
            if (this.emitInteractionChanges) {
                this.interactionChanges.push({ [OP_TYPES.MINT]: nft.getId() });
            }
        }
        catch (e: any) {
            invalidate(nft.getId(), e.message);
            return true;
        }
        return false;
    }
    /**
     * Send an NFT to an arbitrary recipient.
     * You can only SEND an existing NFT (one that has not been BURNd yet).
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/send.md
     */
    async send(remark: Remark) {
        const invalidate = this.updateInvalidCalls(OP_TYPES.SEND, remark).bind(this);
        const sendEntity = Send.fromRemark(remark.remark);
        if (typeof sendEntity === "string") {
            invalidate(remark.remark, `[${OP_TYPES.SEND}] Dead before instantiation: ${sendEntity}`);
            return true;
        }
        const consolidatedNFT = await this.dbAdapter.getNFTByIdUnique(sendEntity.id);
        const nft = consolidatedNFTtoInstance(consolidatedNFT);
        try {
            if (nft === null || nft === void 0 ? void 0 : nft.owner) {
                await invalidateIfRecursion(sendEntity.id, sendEntity.recipient, this.dbAdapter);
                await invalidateIfParentIsForsale(nft ? nft.owner : null, this.dbAdapter);
            }
            await sendInteraction(remark, sendEntity, this.dbAdapter, nft);
            if (nft && consolidatedNFT) {
                await this.dbAdapter.updateNFTSend(nft, consolidatedNFT);
                await this.dbAdapter.updateNFTChildrenRootOwner(nft);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({ [OP_TYPES.SEND]: nft.getId() });
                }
            }
        }
        catch (e: any) {
            invalidate(sendEntity.id, e.message);
            return true;
        }
        return false;
    }
    /**
     * A LIST interaction lists an NFT as available for sale. The NFT can be instantly purchased.
     * A listing can be canceled, and is automatically considered canceled when a BUY is executed on top of a given LIST.
     * You can only LIST an existing NFT (one that has not been BURNd yet).
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/list.md
     */
    async list(remark: Remark) {
        const invalidate = this.updateInvalidCalls(OP_TYPES.LIST, remark).bind(this);
        const listEntity = List.fromRemark(remark.remark);
        if (typeof listEntity === "string") {
            invalidate(remark.remark, `[${OP_TYPES.LIST}] Dead before instantiation: ${listEntity}`);
            return true;
        }
        const consolidatedNFT = await this.dbAdapter.getNFTByIdUnique(listEntity.id);
        const nft = (0, utils_1.consolidatedNFTtoInstance)(consolidatedNFT);
        try {
            if (nft === null || nft === void 0 ? void 0 : nft.owner) {
                await invalidateIfParentIsForsale(nft.owner, this.dbAdapter);
            }
            await (0, list_2.listForSaleInteraction)(remark, listEntity, this.dbAdapter, nft);
            if (nft && consolidatedNFT) {
                await this.dbAdapter.updateNFTList(nft, consolidatedNFT);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({ [constants_1.OP_TYPES.LIST]: nft.getId() });
                }
            }
        }
        catch (e) {
            invalidate(listEntity.id, e.message);
            return true;
        }
        return true;
    }
    /**
     * The BURN interaction burns an NFT for a specific purpose.
     * This is useful when NFTs are spendable like with in-game potions, one-time votes in DAOs, or concert tickets.
     * You can only BURN an existing NFT (one that has not been BURNd yet).
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/burn.md
     */
    async burn(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.BURN, remark).bind(this);
        const burnEntity = burn_1.Burn.fromRemark(remark.remark);
        // Check if burn is valid
        if (typeof burnEntity === "string") {
            invalidate(remark.remark, `[${constants_1.OP_TYPES.BURN}] Dead before instantiation: ${burnEntity}`);
            return true;
        }
        // Find the NFT in state
        const consolidatedNFT = await this.dbAdapter.getNFTByIdUnique(burnEntity.id);
        const nft = (0, utils_1.consolidatedNFTtoInstance)(consolidatedNFT);
        try {
            if (nft === null || nft === void 0 ? void 0 : nft.owner) {
                await invalidateIfParentIsForsale(nft.owner, this.dbAdapter);
            }
            await (0, burn_2.burnInteraction)(remark, burnEntity, this.dbAdapter, nft);
            if (nft && consolidatedNFT) {
                await this.dbAdapter.updateNFTBurn(nft, consolidatedNFT);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({ [constants_1.OP_TYPES.BURN]: nft.getId() });
                }
            }
        }
        catch (e) {
            invalidate(burnEntity.id, e.message);
            return true;
        }
        return true;
    }
    /**
     * The BUY interaction allows a user to immediately purchase an NFT listed for sale using the LIST interaction,
     * as long as the listing hasn't been canceled.
     * You can only BUY an existing NFT (one that has not been BURNd yet).
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/buy.md
     */
    async buy(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.BUY, remark).bind(this);
        const buyEntity = buy_1.Buy.fromRemark(remark.remark);
        if (typeof buyEntity === "string") {
            invalidate(remark.remark, `[${constants_1.OP_TYPES.BUY}] Dead before instantiation: ${buyEntity}`);
            return true;
        }
        const consolidatedNFT = await this.dbAdapter.getNFTByIdUnique(buyEntity.id);
        const nft = (0, utils_1.consolidatedNFTtoInstance)(consolidatedNFT);
        try {
            if (nft === null || nft === void 0 ? void 0 : nft.owner) {
                await invalidateIfParentIsForsale(nft.owner, this.dbAdapter);
            }
            await (0, buy_2.buyInteraction)(remark, buyEntity, this.dbAdapter, nft, this.ss58Format);
            if (nft && consolidatedNFT) {
                await this.dbAdapter.updateNFTBuy(nft, consolidatedNFT);
                await this.dbAdapter.updateNFTChildrenRootOwner(nft);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({ [constants_1.OP_TYPES.BUY]: nft.getId() });
                }
            }
        }
        catch (e) {
            invalidate(buyEntity.id, e.message);
            return true;
        }
        return true;
    }
    /**
     * React to an NFT with an emoticon.
     * You can only EMOTE on an existing NFT (one that has not been BURNd yet).
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/emote.md
     */
    async emote(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.EMOTE, remark).bind(this);
        const emoteEntity = emote_1.Emote.fromRemark(remark.remark);
        if (typeof emoteEntity === "string") {
            invalidate(remark.remark, `[${constants_1.OP_TYPES.EMOTE}] Dead before instantiation: ${emoteEntity}`);
            return true;
        }
        const consolidatedNFT = await this.dbAdapter.getNFTById(emoteEntity.id);
        const nft = (0, utils_1.consolidatedNFTtoInstance)(consolidatedNFT);
        try {
            (0, emote_2.emoteInteraction)(remark, emoteEntity, nft, this.emitEmoteChanges);
            if (nft && consolidatedNFT) {
                await this.dbAdapter.updateNFTEmote(nft, consolidatedNFT);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({ [constants_1.OP_TYPES.EMOTE]: nft.getId() });
                }
            }
        }
        catch (e) {
            invalidate(emoteEntity.id, e.message);
            return true;
        }
        return false;
    }
    /**
     * The CHANGEISSUER interaction allows a collection OR base issuer to change the issuer field to another address.
     * The original issuer immediately loses all rights to mint further NFTs or base parts inside that collection or base.
     * This is particularly useful when selling the rights to a collection's or base operation
     * or changing the issuer to a null address to relinquish control over it.
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/changeissuer.md
     */
    async changeIssuer(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.CHANGEISSUER, remark).bind(this);
        let changeIssuerEntity;
        try {
            changeIssuerEntity = (0, changeIssuer_1.getChangeIssuerEntity)(remark);
        }
        catch (e) {
            invalidate(remark.remark, e.message);
            return true;
        }
        try {
            const onSuccess = (id) => {
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({
                        [constants_1.OP_TYPES.CHANGEISSUER]: id,
                    });
                }
            };
            // NFT Collection id always starts from block number
            // Base id always starts with base- prefix
            if (changeIssuerEntity.id.startsWith("base-")) {
                // This is BASE change
                await (0, utils_1.changeIssuerBase)(changeIssuerEntity, remark, onSuccess, this.dbAdapter);
            }
            else {
                // This is NFT Collection change
                await (0, utils_1.changeIssuerCollection)(changeIssuerEntity, remark, onSuccess, this.dbAdapter);
            }
        }
        catch (e) {
            invalidate(changeIssuerEntity.id, e.message);
            return true;
        }
        return false;
    }
    /**
     * The EQUIPPABLE interaction allows a Base owner to modify the list of equippable collectiones on a Base's slot.
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/equippable.md
     */
    async equippable(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.EQUIPPABLE, remark).bind(this);
        const equippableEntity = equippable_2.Equippable.fromRemark(remark.remark);
        if (typeof equippableEntity === "string") {
            invalidate(remark.remark, `[${constants_1.OP_TYPES.EQUIPPABLE}] Dead before instantiation: ${equippableEntity}`);
            return true;
        }
        const consolidatedBase = await this.dbAdapter.getBaseById(equippableEntity.id);
        const base = (0, utils_1.consolidatedBasetoInstance)(consolidatedBase);
        try {
            (0, equippable_1.equippableInteraction)(remark, equippableEntity, base);
            if (base && consolidatedBase) {
                await this.dbAdapter.updateBaseEquippable(base, consolidatedBase);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({ [constants_1.OP_TYPES.EQUIPPABLE]: base.getId() });
                }
            }
        }
        catch (e) {
            invalidate(equippableEntity.id, e.message);
            return true;
        }
        return false;
    }
    /**
     * The RESADD interaction allows anyone to send new resource to a target NFT
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/resadd.md
     */
    async resadd(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.RESADD, remark).bind(this);
        const resaddEntity = resadd_1.Resadd.fromRemark(remark.remark);
        if (typeof resaddEntity === "string") {
            invalidate(remark.remark, `[${constants_1.OP_TYPES.RESADD}] Dead before instantiation: ${resaddEntity}`);
            return true;
        }
        const consolidatedNFT = await this.dbAdapter.getNFTByIdUnique(resaddEntity.nftId);
        const nft = (0, utils_1.consolidatedNFTtoInstance)(consolidatedNFT);
        try {
            await (0, resadd_2.resAddInteraction)(remark, resaddEntity, this.dbAdapter, nft);
            if (nft && consolidatedNFT) {
                await this.dbAdapter.updateNftResadd(nft, consolidatedNFT);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({ [constants_1.OP_TYPES.RESADD]: nft.getId() });
                }
            }
        }
        catch (e) {
            invalidate(resaddEntity.nftId, e.message);
            return true;
        }
        return false;
    }
    /**
     * The ACCEPT interaction allows NFT owner to accept pending resource or child NFT new resource toon a target NFT
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/accept.md
     */
    async accept(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.ACCEPT, remark).bind(this);
        const acceptEntity = accept_1.Accept.fromRemark(remark.remark);
        if (typeof acceptEntity === "string") {
            invalidate(remark.remark, `[${constants_1.OP_TYPES.ACCEPT}] Dead before instantiation: ${acceptEntity}`);
            return true;
        }
        const consolidatedNFT = await this.dbAdapter.getNFTByIdUnique(acceptEntity.nftId);
        const nft = (0, utils_1.consolidatedNFTtoInstance)(consolidatedNFT);
        try {
            await (0, accept_2.acceptInteraction)(remark, acceptEntity, this.dbAdapter, nft);
            if (nft && consolidatedNFT) {
                await this.dbAdapter.updateNftAccept(nft, consolidatedNFT, acceptEntity.entity);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({ [constants_1.OP_TYPES.ACCEPT]: nft.getId() });
                }
            }
        }
        catch (e) {
            invalidate(acceptEntity.nftId, e.message);
            return true;
        }
        return false;
    }
    /**
     * The EQUIP interaction allows NFT owner to equip another NFT in it's parent's base slot
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/equip.md
     */
    async equip(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.EQUIP, remark).bind(this);
        const equipEntity = equip_1.Equip.fromRemark(remark.remark);
        if (typeof equipEntity === "string") {
            invalidate(remark.remark, `[${constants_1.OP_TYPES.EQUIP}] Dead before instantiation: ${equipEntity}`);
            return true;
        }
        const consolidatedNFT = await this.dbAdapter.getNFTByIdUnique(equipEntity.id);
        const nft = (0, utils_1.consolidatedNFTtoInstance)(consolidatedNFT);
        const consolidatedParentNFT = await this.dbAdapter.getNFTByIdUnique((nft === null || nft === void 0 ? void 0 : nft.owner) || "");
        const parentNft = (0, utils_1.consolidatedNFTtoInstance)(consolidatedParentNFT);
        try {
            await (0, equip_2.equipInteraction)(remark, equipEntity, this.dbAdapter, nft, parentNft);
            if (parentNft && consolidatedParentNFT) {
                await this.dbAdapter.updateEquip(parentNft, consolidatedParentNFT);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({ [constants_1.OP_TYPES.EQUIP]: parentNft.getId() });
                }
            }
        }
        catch (e) {
            invalidate(equipEntity.id, e.message);
            return true;
        }
        return false;
    }
    /**
     * The SETPRIORITY interaction allows NFT owner to change resource priority array on NFT
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/setpriority.md
     */
    async setpriority(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.SETPRIORITY, remark).bind(this);
        const setPriorityEntity = setpriority_2.Setpriority.fromRemark(remark.remark);
        if (typeof setPriorityEntity === "string") {
            invalidate(remark.remark, `[${constants_1.OP_TYPES.SETPRIORITY}] Dead before instantiation: ${setPriorityEntity}`);
            return true;
        }
        const consolidatedNFT = await this.dbAdapter.getNFTByIdUnique(setPriorityEntity.id);
        const nft = (0, utils_1.consolidatedNFTtoInstance)(consolidatedNFT);
        try {
            await (0, setpriority_1.setPriorityInteraction)(remark, setPriorityEntity, this.dbAdapter, nft);
            if (nft && consolidatedNFT) {
                await this.dbAdapter.updateSetPriority(nft, consolidatedNFT);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({ [constants_1.OP_TYPES.SETPRIORITY]: nft.getId() });
                }
            }
        }
        catch (e) {
            invalidate(setPriorityEntity.id, e.message);
            return true;
        }
        return false;
    }
    /**
     * The SETPROPERTY interaction allows NFT owner to change or set new property on NFT
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/setproperty.md
     */
    async setproperty(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.SETPROPERTY, remark).bind(this);
        const setPropertyEntity = setproperty_1.Setproperty.fromRemark(remark.remark);
        if (typeof setPropertyEntity === "string") {
            invalidate(remark.remark, `[${constants_1.OP_TYPES.SETPROPERTY}] Dead before instantiation: ${setPropertyEntity}`);
            return true;
        }
        const consolidatedNFT = await this.dbAdapter.getNFTByIdUnique(setPropertyEntity.id);
        const nft = (0, utils_1.consolidatedNFTtoInstance)(consolidatedNFT);
        try {
            await (0, setproperty_2.setPropertyInteraction)(remark, setPropertyEntity, this.dbAdapter, nft);
            if (nft && consolidatedNFT) {
                await this.dbAdapter.updateSetAttribute(nft, consolidatedNFT);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({
                        [constants_1.OP_TYPES.SETPROPERTY]: nft.getId(),
                    });
                }
            }
        }
        catch (e) {
            invalidate(setPropertyEntity.id, e.message);
            return true;
        }
        return false;
    }
    /**
     * The THEMEADD interaction allows BASE issuer to add a new theme to a Base
     * https://github.com/rmrk-team/rmrk-spec/blob/master/standards/rmrk2.0.0/interactions/themeadd.md
     */
    async themeadd(remark) {
        const invalidate = this.updateInvalidCalls(constants_1.OP_TYPES.THEMEADD, remark).bind(this);
        const themeAddEntity = themeadd_1.Themeadd.fromRemark(remark.remark);
        if (typeof themeAddEntity === "string") {
            invalidate(remark.remark, `[${constants_1.OP_TYPES.THEMEADD}] Dead before instantiation: ${themeAddEntity}`);
            return true;
        }
        const consolidatedBase = await this.dbAdapter.getBaseById(themeAddEntity.baseId);
        const base = (0, utils_1.consolidatedBasetoInstance)(consolidatedBase);
        try {
            (0, themeadd_2.themeAddInteraction)(remark, themeAddEntity, base);
            if (base && consolidatedBase) {
                await this.dbAdapter.updateBaseThemeAdd(base, consolidatedBase);
                if (this.emitInteractionChanges) {
                    this.interactionChanges.push({
                        [constants_1.OP_TYPES.THEMEADD]: base.getId(),
                    });
                }
            }
        }
        catch (e) {
            invalidate(themeAddEntity.baseId, e.message);
            return true;
        }
        return false;
    }
    async consolidate(rmrks) {
        const remarks = rmrks || [];
        // console.log(remarks);
        for (const remark of remarks) {
            // console.log('==============================');
            // console.log('Remark is: ' + remark.remark);
            switch (remark.interaction_type) {
                case constants_1.OP_TYPES.CREATE:
                    if (await this.create(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.MINT:
                    if (await this.mint(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.SEND:
                    if (await this.send(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.BUY:
                    // An NFT was bought after being LISTed
                    if (await this.buy(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.BURN:
                    // An NFT was burned
                    if (await this.burn(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.LIST:
                    // An NFT was listed for sale
                    if (await this.list(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.EMOTE:
                    if (await this.emote(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.CHANGEISSUER:
                    if (await this.changeIssuer(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.BASE:
                    if (await this.base(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.EQUIPPABLE:
                    if (await this.equippable(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.RESADD:
                    if (await this.resadd(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.ACCEPT:
                    if (await this.accept(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.EQUIP:
                    if (await this.equip(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.SETPRIORITY:
                    if (await this.setpriority(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.SETPROPERTY:
                    if (await this.setproperty(remark)) {
                        continue;
                    }
                    break;
                case constants_1.OP_TYPES.THEMEADD:
                    if (await this.themeadd(remark)) {
                        continue;
                    }
                    break;
                default:
                    console.error("Unable to process this remark - wrong type: " +
                        remark.interaction_type);
            }
        }
        // deeplog(this.nfts);
        // deeplog(this.collections);
        //console.log(this.invalidCalls);
        // console.log(
        //   `${this.nfts.length} NFTs across ${this.collections.length} collections.`
        // );
        // console.log(`${this.invalidCalls.length} invalid calls.`);
        const result = {
            nfts: this.dbAdapter.getAllNFTs
                ? await this.dbAdapter.getAllNFTs()
                : {},
            collections: this.dbAdapter.getAllCollections
                ? await this.dbAdapter.getAllCollections()
                : {},
            bases: this.dbAdapter.getAllBases
                ? await this.dbAdapter.getAllBases()
                : {},
            invalid: this.invalidCalls,
        };
        if (this.emitInteractionChanges) {
            result.changes = this.interactionChanges;
        }
        return result;
    }
}
exports.Consolidator = Consolidator;
