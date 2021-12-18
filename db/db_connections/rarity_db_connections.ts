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

// TODO addMetadata(), addRarity(), getMetadata(), getRarity(), getNftCollection()
