import { Nft } from '../generated/model/index';
import fetch from 'node-fetch';

const WAIT_BETWEEN_FETCHES = 2 * 1000;     // how long to wait between fetches of rmrks from the database to not overload the db with requests
let lastRetrievedBlock = 0;


async function fetchNftsAndCollections() {
    await fetch('http://localhost:4000/graphql', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // body: JSON.stringify({query: `{ rmrkEntities (where: {block_gte: "${lastRetrievedBlock}"}, orderBy: block_DESC) { id block rmrk { caller interactionType remark rmrkVersion extraEx { call caller value } } } }`})
        body: JSON.stringify({query: `{ nfts (where: {block_gte: "${lastRetrievedBlock}"}, orderBy: block_DESC) { block collection id metadata sn symbol transferable version } }`})
    })
        .then(res => res.json())
        .then(async data => {
            // TODO
            console.log("data: ", JSON.stringify(data))
            // if rmrk entities are not empty
            if (data && data.data && data.data.nfts && data.data.nfts.length > 0) {
                // get the biggest block you have retrieved
                // (which is the first rmrk in data, as they are ordered by ascending block number)
                lastRetrievedBlock = data.data.nfts[0].block;

                console.log(nfts, collections);
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
