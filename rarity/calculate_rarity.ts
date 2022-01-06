import fetch from 'node-fetch';

async function fetchCollections(condition?: string) {
    return await fetch('http://localhost:4000/graphql', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({query: "{ collections { id max } }"})
    })
        .then(res => res.json())
        //.then(data => console.log(data));
        // TODO should be like fetchNfts()
        .then(data => data.data.collections);
}
fetchCollections().then(collections => {
    console.log(collections);
    // TODO for each collection get the nfts and their metadatas from the db and calculate their rarities
});
