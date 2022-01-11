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

export async function getMetadataJoinCollectionId(collection_id: string, DB_POOL: Pool) {
    const query = `SELECT * FROM metadatas JOIN nfts ON metadatas.id = nfts.nft_id WHERE nfts.collection_id = $1`;
    const values = [ collection_id ];

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

export async function getLastRetrievedBlockNfts(DB_POOL: Pool) {
    const query = 'SELECT last_retrieved_block_nfts from metadata_information';

    return DB_POOL.query(query);
}

export async function saveLastRetrievedBlockNfts(last_retrieved_block_nfts: number, DB_POOL: Pool) {
    const query = `UPDATE metadata_information SET last_retrieved_block_nfts = $1`;
    const values = [ last_retrieved_block_nfts ];

    return DB_POOL.query(query, values);
}

export async function getLastRetrievedBlockCollections(DB_POOL: Pool) {
    const query = 'SELECT last_retrieved_block_collections from metadata_information';

    return DB_POOL.query(query);
}

export async function saveLastRetrievedBlockCollections(last_retrieved_block_collections: number, DB_POOL: Pool) {
    const query = `UPDATE metadata_information SET last_retrieved_block_collections = $1`;
    const values = [ last_retrieved_block_collections ];

    return DB_POOL.query(query, values);
}

// not sure if it wil ever be used
export async function updateNftCollection(nft_id: string, collection: string, DB_POOL: Pool) {
    const query = `UPDATE nfts SET collection_id = $2 WHERE nft_id = $1`;
    const values = [ nft_id, collection ];

    return DB_POOL.query(query, values);
}
