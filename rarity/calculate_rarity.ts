import fetch from 'node-fetch';
require('dotenv').config();
const { Pool } = require("pg");
import { Collection } from '../generated/model/index';
import { getMetadataJoinCollectionId, getLastRetrievedCollection, saveLastRetrievedCollection } from '../db/db_connections/rarity_db_connections';

// TODO code duplication + extract the fetching of collections to fetchNftsAndCollections.ts

// keep track of the last retrieved collection id from the graphql db
//  this default value will be overwritten in fetchAllCollections() with a value from the db
let lastRetrievedCollection = 0;


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
        body: JSON.stringify({query: `{ collections (where: {idIndexing_gte: "${lastRetrievedCollection}"}, orderBy: idIndexing_ASC) { id idIndexing block max } }`})
    })
        .then(res => res.json())
        //.then(data => console.log(data));
        .then(async data => {
            // if rmrk collections are not empty (so there are new collections saved to the graphql db)
            if (data && data.data && data.data.collections && data.data.collections.length > 0) {
                const collections = data.data.collections;

                // get the biggest id_indexing you have retrieved
                //  (which is from the last collection in data, as they are ordered by ascending idIndexing number)
                lastRetrievedCollection = collections[collections.length - 1].idIndexing;

                // if there is only one fetched collections and it is from the lastRetrievedCollection, wait for a little bit longer
                //  because there are no new collections added to the db
                if (collections.length === 1 && collections[0].idIndexing === lastRetrievedCollection) {
                    WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_WAITING_FOR_NEW_RMRKS;
                    // reset lastRetrievedCollection back to 0 so that the rarities of newly added nfts from older collections will be recalculated
                    if (COUNTER_WAITING_FOR >= MAX_COUNTER_WAITING_FOR) {
                        lastRetrievedCollection = 0;
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
    await saveLastRetrievedCollection(lastRetrievedCollection, DB_POOL);
    await DB_POOL.end();
    process.exit(1);
});

async function fetchAllCollections() {
    lastRetrievedCollection = <number>(await getLastRetrievedCollection(DB_POOL)).rows[0].last_retrieved_collection;
    while(true) {
        await fetchCollections().then(async (collections) => {
            // console.log(collections);
            // TODO for each collection get the nfts and their metadatas from the db and calculate their rarities
            await Promise.all(collections.map(async (collection: Collection) => {
                const nft_metadata_rows = (await getMetadataJoinCollectionId(collection.id, DB_POOL)).rows;

                if (nft_metadata_rows) {
                    // TODO save attributes of each nft in a dictionary
                    // also missing attribute should be labeled as None or null
                    let attribute_list: string[] = [];
                    nft_metadata_rows.map(metadata => {
                        const nft_attributes = JSON.parse(metadata.metadata_json).attributes;
                        if (nft_attributes && nft_attributes.length > 0)
                            // TODO save lastRetrievedCollection only AFTER calculating the rarity to the db
                            //  maybe instead of lastRetrievedCollection = nfts[nfts.length - 1].idIndexing;
                            //  save it in a temporary variable and update lastRetrievedCollection here
                            //  after saving the calculated rarity to the database
                            console.log(nft_attributes);
                    });
                }
            }));
        }).catch(err => { console.error(err); process.exit(-1); });
        await sleep(WAIT_BETWEEN_FETCHES);
        console.log(lastRetrievedCollection);
    }
}

fetchAllCollections().then();
