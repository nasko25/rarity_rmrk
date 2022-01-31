export interface NFTConsolidated {
    id: string;
    block: number;
    collection: string;
    symbol: string;
    transferable: number;
    sn: string;
    metadata?: string;
    forsale: bigint;
    reactions: Reactionmap;
    changes: Change[];
    owner: string;
    rootowner: string;
    burned: string;
    equipped?: string;
    priority: string[];
    children: NFTChild[];
    resources: IResourceConsolidated[];
    properties?: IProperties;
    pending: boolean;
}

export interface CollectionConsolidated {
    block: number;
    max: number;
    issuer: string;
    symbol: string;
    id: string;
    metadata: string;
    changes: Change[];
}
