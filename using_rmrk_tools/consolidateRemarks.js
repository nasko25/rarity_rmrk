const { Consolidator } = require('rmrk-tools')
const fetch = require('node-fetch');

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
        .then(data => {
            console.log("data: ", data)
            // if rmrk entities are not empty
            if (data.data.rmrkEntities.length > 0) {
                // get the biggest block you have retrieved
                // (which is the first rmrk in data, as they are ordered by ascending block number)
                lastRetrievedBlock = data.data.rmrkEntities[0].block;
            }
        });
}

async function fetchAllRmrkEntities() {
    while (lastRetrievedBlock < 9469350) {
        await fetchRmrkEntities();
        console.log(lastRetrievedBlock)
    }
}

fetchAllRmrkEntities().then();

//const { nfts, collections } = await consolidator.consolidate(remarks);
//
//console.log(nfts, collections);
