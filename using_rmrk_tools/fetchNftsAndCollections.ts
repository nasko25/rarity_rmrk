import { Nft } from '../generated/model/index';
import fetch from 'node-fetch';

const WAIT_BETWEEN_FETCHES_NORMAL = 2 * 1000;                         // how long to wait between fetches of rmrks from the database to not overload the db with requests normally
const WAIT_BETWEEN_FETCHES_WAITING_FOR_NEW_RMRKS = 1 * 60 * 1000;     // how long to wait between fetches of rmrks when the last fetched rmrk was not new (so no new rmrks were saved in the db between the last 2 requests)


let lastRetrievedBlock = 0;
let WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_NORMAL;

// TODO add 'where' as a parameter and fetch collections
async function fetchNftsAndCollections() {
    await fetch('http://localhost:4000/graphql', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // body: JSON.stringify({query: `{ rmrkEntities (where: {block_gte: "${lastRetrievedBlock}"}, orderBy: block_DESC) { id block rmrk { caller interactionType remark rmrkVersion extraEx { call caller value } } } }`})
        body: JSON.stringify({query: `{ nfts (where: {block_gte: "${lastRetrievedBlock}"}, orderBy: block_ASC) { block collection id metadata sn symbol transferable version } }`})
    })
        .then(res => res.json())
        .then(async data => {
            // TODO
            console.log("data: ", JSON.stringify(data))
            // if rmrk entities are not empty
            if (data && data.data && data.data.nfts && data.data.nfts.length > 0) {
                const nfts = data.data.nfts;
                // if there is only one fetched nft and it is the lastRetrievedBlock, wait for a little bit longer
                //  because that means there are no new nfts added to the db
                if (nfts.length === 1 && nfts[0].block === lastRetrievedBlock) {
                    WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_WAITING_FOR_NEW_RMRKS;
                } else {
                    WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_NORMAL;
                }
                // get the biggest block you have retrieved
                // (which is the last nft in data, as they are ordered by ascending block number)
                lastRetrievedBlock = nfts[nfts.length - 1].block;

                console.log(nfts);
            }
        });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

process.on ('SIGINT',() => {
    console.log('Exiting');
    process.exit(1);
});

async function fetchAllNftsAndCollections() {
    while (true) {
        console.log("Fetching rmrk entities from the database...");
        await fetchNftsAndCollections();
        console.log("Fetching done\nWaiting before fetching the next batch...");
        await sleep(WAIT_BETWEEN_FETCHES);
        console.log(lastRetrievedBlock)
    }
}

fetchAllNftsAndCollections().then();

//const { nfts, collections } = await consolidator.consolidate(remarks);
//
//console.log(nfts, collections);
