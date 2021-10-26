const { Consolidator } = require('rmrk-tools')
const fetch = require('node-fetch');

const consolidator = new Consolidator();

fetch('http://localhost:4000/graphql', {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({query: "{ rmrkEntities { id block } }"})
}).then(res => res.json())
    .then(data => console.log("data: ", data));

//const { nfts, collections } = await consolidator.consolidate(remarks);
//
//console.log(nfts, collections);
