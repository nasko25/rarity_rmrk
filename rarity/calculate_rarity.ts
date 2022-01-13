import fetch from 'node-fetch';
require('dotenv').config();
const { Pool } = require("pg");
import { Collection } from '../generated/model/index';
import { getMetadataJoinCollectionId, getLastRetrievedBlockCollections, saveLastRetrievedBlockCollections } from '../db/db_connections/rarity_db_connections';

// TODO code duplication + extract the fetching of collections to fetchNftsAndCollections.ts

// keep track of the last retrieved collection block from the graphql db
let lastRetrievedBlock = 0;


const WAIT_BETWEEN_FETCHES_NORMAL = 2 * 1000;                         // how long to wait between fetches of rmrks from the database to not overload the db with requests normally
const WAIT_BETWEEN_FETCHES_WAITING_FOR_NEW_RMRKS = 1 * 60 * 1000;     // how long to wait between fetches of rmrks when the last fetched rmrk was not new (so no new rmrks were saved in the db between the last 2 requests)

// how long to wait between fetches of collections from the graphql db
//  this initial value is overwritten with a value taken from the db in fetchAllCollections()
let WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_NORMAL;

// keep track of how many times you have queried the db consecutively and it was still waiting for new collections
let COUNTER_WAITING_FOR = 0;
// how many maximum cycles to wait for while the db still has no new collections
// after lastRetrievedBlock will be reset to 0 to recalculate the rarities of the existing collections
//  (in case new nfts were added after the previous rarities were calculated)
const MAX_COUNTER_WAITING_FOR = 6;

// TODO export that as well
// postgres pool configuration
const DB_CREDENTIALS = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    // hardcoded in ../db/sql/rarity.sql
    database: "rarity_rmrk",
    port: process.env.DB_PORT
};
const DB_POOL = new Pool(DB_CREDENTIALS);

async function fetchCollections(condition?: string) {
    return await fetch('http://localhost:4000/graphql', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({query: `{ collections (where: {block_gte: "${lastRetrievedBlock}"}, orderBy: block_ASC) { id block max } }`})
    })
        .then(res => res.json())
        //.then(data => console.log(data));
        .then(async data => {
            // if rmrk collections are not empty (so there are new collections saved to the graphql db)
            if (data && data.data && data.data.collections && data.data.collections.length > 0) {
                const collections = data.data.collections;

                // get the biggest block you have retrieved
                //  (which is from the last collection in data, as they are ordered by ascending block number)
                lastRetrievedBlock = collections[collections.length - 1].block;

                // if there is only one fetched collections and it is from the lastRetrievedBlock, wait for a little bit longer
                //  because there are no new collections added to the db
                if (collections.length === 1 && collections[0].block === lastRetrievedBlock) {
                    WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_WAITING_FOR_NEW_RMRKS;
                    // reset lastRetrievedBlock back to 0 so that the rarities of newly added nfts from older collections will be recalculated
                    if (COUNTER_WAITING_FOR >= MAX_COUNTER_WAITING_FOR) {
                        lastRetrievedBlock = 0;
                        COUNTER_WAITING_FOR = 0;
                    } else {
                        COUNTER_WAITING_FOR++;
                    }
                } else {
                    WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_NORMAL;
                    COUNTER_WAITING_FOR = 0;
                }

                return collections;
            }
        });
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

process.on ('SIGINT', async () => {
    console.log('Exiting');
    await saveLastRetrievedBlockCollections(lastRetrievedBlock, DB_POOL);
    await DB_POOL.end();
    process.exit(1);
});

async function fetchAllCollections() {
    lastRetrievedBlock = <number>(await getLastRetrievedBlockCollections(DB_POOL)).rows[0].last_retrieved_block_collections;
    while(true) {
        await fetchCollections().then(async (collections) => {
            // console.log(collections);
            // TODO for each collection get the nfts and their metadatas from the db and calculate their rarities
            await Promise.all(collections.map(async (collection: Collection) => {
                const nft_metadata_rows = (await getMetadataJoinCollectionId(collection.id, DB_POOL)).rows;

                if (nft_metadata_rows) {
                    // TODO save attributes of each nft in a dictionary
                    // also missing attribute should be labeled as None or null
                    nft_metadata_rows.map(metadata => console.log(JSON.parse(metadata.metadata_json).attributes));
                }
            }));
        }).catch(err => { console.error(err); process.exit(-1); });
        await sleep(WAIT_BETWEEN_FETCHES);
    }
}

fetchAllCollections().then();
