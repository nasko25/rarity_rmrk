const fetch = require('node-fetch');

async function fetchNfts(condition) {
    return await fetch('http://localhost:4000/graphql', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({query: "{ nfts { block collection id metadata rmrkVersion sn symbol transferable } }"})
    })
        .then(res => res.json())
        //.then(data => console.log(data));
        .then(data => data.data.nfts);
}
fetchNfts().then(nfts => {
    console.log(nfts);
});
// TOOD calculate rarity
