import { Nft } from '../../generated/model/index';
import { Pool } from "pg";

export async function addNft(nft: Nft, DB_POOL: Pool) {
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

export async function addMetadata(nft_id: string, metadata: string, DB_POOL: Pool) {
    const query = `
        INSERT INTO metadatas (id, metadata_json)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET metadata_json = EXCLUDED.metadata_json
        RETURNING id
    `;
    const values = [ nft_id, metadata ];

    return DB_POOL.query(query, values);
}

export async function addRarity(nft_id: string, rarity: number, DB_POOL: Pool) {
    const query = `
        INSERT INTO rarities (id, rarity)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET rarity = EXCLUDED.rarity
        RETURNING id
    `;
    const values = [ nft_id, rarity ];

    return DB_POOL.query(query, values);
}

export async function getMetadata(nft_id: string, DB_POOL: Pool) {
    const query = `SELECT * FROM metadatas WHERE id = $1`;
    const values = [ nft_id ];

    return DB_POOL.query(query, values);
}

export async function getRarity(nft_id: string, DB_POOL: Pool) {
    const query = `SELECT * FROM rarities WHERE id = $1`;
    const values = [ nft_id ];

    return DB_POOL.query(query, values);
}

export async function getNftCollection(nft_id: string, DB_POOL: Pool) {
    const query = `SELECT * FROM nfts WHERE nft_id = $1`;
    const values = [ nft_id ];

    return DB_POOL.query(query, values);
}

// not sure if it wil ever be used
export async function updateNftCollection(nft_id: string, collection: string, DB_POOL: Pool) {
    const query = `UPDATE nfts SET collection_id = $2 WHERE nft_id = $1`;
    const values = [ nft_id, collection ];

    return DB_POOL.query(query, values);
}
