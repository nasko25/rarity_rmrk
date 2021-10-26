const { fetchRemarks, getRemarksFromBlocks, getLatestFinalizedBlock, Consolidator } = require('rmrk-tools');
const { ApiPromise, WsProvider } = require('@polkadot/api')
const fetch = require('node-fetch');

const wsProvider = new WsProvider('wss://node.rmrk.app');

const fetchAndConsolidate = async () => {
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        // const from = 6431422;
        const from = 8951000;
        // const to = await getLatestFinalizedBlock(api);
        // const to = 6431422+20000;
        const to = 8951100;

        const remarkBlocks = await fetchRemarks(api, from, to, ['']);
        console.log("fetched\n\n", remarkBlocks, "\n\na call looks like this:", remarkBlocks[0].calls[0], "\n\n");
        if (remarkBlocks && remarkBlocks.length !== 0) {
            // console.log([...Buffer.from("rmrk::MINT")]);
            // console.log(Buffer.from("rmrk::MINT"));
            // console.log(remarkBlocks[0].calls[0]);
            // console.log(remarkBlocks[0].calls[0]);
            const remarks = getRemarksFromBlocks(remarkBlocks, ["0x726d726b", "0x524d524b"]);   // rmrk and RMRK
            console.log(remarks)
            // TODO pass a db adapter to the Consolidator to be able to fetch and update nfts from the store
            const consolidator = new Consolidator();
            const { nfts, collections } = await consolidator.consolidate(remarks);
            console.log('Consolidated nfts:', nfts);
            console.log('Consolidated collections:', collections);
        }
    } catch (error) {
        console.log(error)
    }
}

// fetch('http://localhost:4000/graphql', {
//     method: "POST",
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//     },
//     body: JSON.stringify({query: "{ hello { greeting } }"})
// }).then(res => res.json())
//     .then(data => console.log("data: ", data));

fetchAndConsolidate().then(() => wsProvider.disconnect());
