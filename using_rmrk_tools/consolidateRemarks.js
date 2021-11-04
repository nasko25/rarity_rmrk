const { Consolidator } = require('rmrk-tools')
const fetch = require('node-fetch');

const WAIT_BETWEEN_FETCHES = 10 * 1000;     // how long to wait between fetches of rmrks from the database to not overload the db with requests
const consolidator = new Consolidator();
let lastRetrievedBlock = 0;


async function fetchRmrkEntities() {
    await fetch('http://localhost:4000/graphql', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({query: `{ rmrkEntities (where: {block_gte: "${lastRetrievedBlock}"}, orderBy: block_DESC) { id block rmrk { caller interactionType remark rmrkVersion extraEx { call caller value } } } }`})
    })
        .then(res => res.json())
        .then(async data => {
            console.log("data: ", JSON.stringify(data))
            // if rmrk entities are not empty
            if (data.data.rmrkEntities.length > 0) {
                // get the biggest block you have retrieved
                // (which is the first rmrk in data, as they are ordered by ascending block number)
                lastRetrievedBlock = data.data.rmrkEntities[0].block;

                /* how a rmrk given to consolidate looks like:
                    const r = {
                        block: row.block,
                        caller: call.caller,
                        interaction_type: meta.type,
                        version: meta.version,
                        remark: remark,
                        extra_ex: call.extras,
                    };
                */
                const { nfts, collections } = await consolidator.consolidate(data.data.rmrkEntities);
                console.log(nfts, collections);
            }
        });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllRmrkEntities() {
    while (lastRetrievedBlock < 9469350) {
        console.log("Fetching rmrk entities from the database...");
        await fetchRmrkEntities();
        console.log("Fetching done\nWaiting before fetching the next batch...");
        await sleep(WAIT_BETWEEN_FETCHES);
        console.log(lastRetrievedBlock)
    }
}

fetchAllRmrkEntities().then();

//const { nfts, collections } = await consolidator.consolidate(remarks);
//
//console.log(nfts, collections);
