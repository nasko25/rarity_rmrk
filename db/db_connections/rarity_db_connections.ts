import { Nft } from '../generated/model/index';

export async function addNft(nft: Nft, DB_POOL) {
    // "INSERT ... ON CONFLICT DO NOTHING/UPDATE"
    // https://www.thisdot.co/blog/connecting-to-postgresql-with-node-js
    const query = `
        INSERT INTO nfts (nft_id, collection_id)
        VALUES ($1, $2)
        ON CONFLICT (nft_id) DO UPDATE SET collection_id = EXCLUDED.collection_id
        RETURNING nft_id
    `;
    const values = [ nft.id, nft.collection ];

    return DB_POOL.query(query, values);
}

// TODO getMetadata(), getRarity(), getNftCollection()
export async function addMetadata(nft_id: string, metadata: string, DB_POOL) {
    const query = `
        INSERT INTO metadatas (id, metadata_json)
        VALUES ($1. $2)
        ON CONFLICT (id) DO UPDATE SET metadata_json = EXCLUDED.metadata_json
        RETURNING id
    `;
    const values = [ nft_id, metadata ];

    return DB_POOL.query(query, values);
}

export async function addRarity(nft_id: string, rarity: number, DB_POOL) {
    const query = `
        INSERT INTO rarities (id, rarity)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET rarity = EXCLUDED.rarity
        RETURNING id
    `;
    const values = [ nft_id, rarity ];

    return DB_POOL.query(query, values);
}
