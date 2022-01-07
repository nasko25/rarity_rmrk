import fetch from 'node-fetch';

// TODO code duplication + extract the fetching of collections to fetchNftsAndCollections.ts

// TODO save lastRetrievedBlock to the db ( like in fetchNfts() )
// keep track of the last retrieved collection block from the graphql db
let lastRetrievedBlock = 0;


const WAIT_BETWEEN_FETCHES_NORMAL = 2 * 1000;                         // how long to wait between fetches of rmrks from the database to not overload the db with requests normally
const WAIT_BETWEEN_FETCHES_WAITING_FOR_NEW_RMRKS = 1 * 60 * 1000;     // how long to wait between fetches of rmrks when the last fetched rmrk was not new (so no new rmrks were saved in the db between the last 2 requests)

// how long to wait between fetches of collections from the graphql db
let WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_NORMAL;

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
                // if there is only one fetched collections and it is from the lastRetrievedBlock, wait for a little bit longer
                //  because there are no new collections added to the db
                if (collections.length === 1 && collections[0].block === lastRetrievedBlock) {
                    WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_WAITING_FOR_NEW_RMRKS;
                    // TODO at some point lastRetrievedBlock should be reset back to 0 so that the rarities of newly added nfts from older collections will be recalculated
                } else {
                    WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_NORMAL;
                }

                // get the biggest block you have retrieved
                //  (which is from the last collection in data, as they are ordered by ascending block number)
                lastRetrievedBlock = collections[collections.length - 1].block;

                return collections;
            }
        });
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllCollections() {
    while(true) {
        await fetchCollections().then(collections => {
            console.log(collections);
            // TODO for each collection get the nfts and their metadatas from the db and calculate their rarities
        }).catch(err => { console.error(err); process.exit(-1); });
        await sleep(WAIT_BETWEEN_FETCHES);
    }
}

fetchAllCollections().then();
