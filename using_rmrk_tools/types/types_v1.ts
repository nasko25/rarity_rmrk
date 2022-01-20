import { Change } from "../node_modules/rmrk-tools/dist-cli/src/rmrk1.0.0/changelog";
import { Attribute } from "../node_modules/rmrk-tools/dist-cli/src/rmrk1.0.0/types";
import { IdIndexing } from "types";
export declare class Collection {
    readonly block: number;
    readonly name: string;
    readonly max: number;
    issuer: string;
    readonly symbol: string;
    readonly id: string;
    readonly metadata: string;
    changes: Change[];
    loadedMetadata?: CollectionMetadata;
    constructor(block: number, name: string, max: number, issuer: string, symbol: string, id: string, metadata: string);
    mint(): string;
    change_issuer(address: string): string;
    addChange(c: Change): Collection;
    getChanges(): Change[];
    static generateId(pubkey: string, symbol: string): string;
    static fromRemark(remark: string, block?: number): Collection | string;
    /**
     * TBD - hard dependency on Axios / IPFS to fetch remote
     */
    // private load_metadata;

    id_indexing?: IdIndexing;
}

export declare class NFT {
    readonly block: number;
    readonly collection: string;
    readonly name: string;
    readonly instance: string;
    readonly transferable: number;
    readonly data?: string;
    readonly sn: string;
    readonly metadata?: string;
    updatedAtBlock?: number;
    forsale: bigint;
    reactions: Reactionmap;
    changes: Change[];
    owner: string;
    loadedMetadata?: NFTMetadata;
    burned: string;
    constructor(block: number, collection: string, name: string, instance: string, transferable: number, sn: string, metadata?: string, data?: string, updatedAtBlock?: number);
    getId(): string;
    addChange(c: Change): NFT;
    mintnft(): string;
    send(recipient: string): string;
    static checkDataFormat(data: string): boolean;
    static fromRemark(remark: string, block?: number): NFT | string;
    /**
     * @param price In plancks, so 10000000000 for 0.01 KSM. Set to 0 if canceling listing.
     */
    list(price: bigint | number): string;
    buy(): string;
    consume(): string;
    emote(unicode: string): string;
    /**
     * TBD - hard dependency on Axios / IPFS to fetch remote
     */
    // private load_metadata;
}
export interface NFTMetadata {
    external_url?: string;
    image?: string;
    image_data?: string;
    description?: string;
    name?: string;
    attributes?: Attribute[];
    background_color?: string;
    animation_url?: string;
    youtube_url?: string;
}
export interface Reactionmap {
    [unicode: string]: string[];
}

export interface CollectionMetadata {
    description?: string;
    attributes: Attribute[];
    external_url?: string;
    image?: string;
    image_data?: string;
}


export interface NFTConsolidated {
    id: string;
    block: number;
    collection: string;
    name: string;
    instance: string;
    transferable: number;
    sn: string;
    metadata?: string;
    data?: string;
    forsale: bigint;
    reactions: Reactionmap;
    changes: Change[];
    owner: string;
    loadedMetadata?: NFTMetadata;
    burned: string;
    updatedAtBlock?: number;
}

export interface CollectionConsolidated {
    block: number;
    name: string;
    max: number;
    issuer: string;
    symbol: string;
    id: string;
    metadata: string;
    changes: Change[];
    loadedMetadata?: CollectionMetadata;
    updatedAtBlock?: number;
}
