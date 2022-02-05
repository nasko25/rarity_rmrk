import { Nft } from '../generated/model/index';
import fetch from 'node-fetch';
import ipc from 'node-ipc';
require('dotenv').config();
const { Pool } = require("pg");
import { addNft, addMetadata, getLastRetrievedNft, saveLastRetrievedNft } from '../db/db_connections/rarity_db_connections';

const WAIT_BETWEEN_FETCHES_NORMAL = 2 * 1000;                         // how long to wait between fetches of rmrks from the database to not overload the db with requests normally
const WAIT_BETWEEN_FETCHES_WAITING_FOR_NEW_RMRKS = 1 * 60 * 1000;     // how long to wait between fetches of rmrks when the last fetched rmrk was not new (so no new rmrks were saved in the db between the last 2 requests)


// this initial value is overwritten with the value taken from the db in fetchAndSaveAllNftsAndMetadatas()
let lastRetrievedNft = 0;

// this is used a temporary variable before the last retrieved nft is saved in lastRetrievedNft
//  since exiting in the middle of fetching nft metadata will result in saving lastRetrievedNft in the database
//  before the metadata is saved to the database
let last_id_indexing = 0;

let WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_NORMAL;

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


// ipc configuration
ipc.config.id = "client";
ipc.config.retry = 1500 * 60;
ipc.config.silent = true;
// stop retrying after 10 requests
ipc.config.maxRetries = 10;
// ipc.config.stopRetrying = true;

// silent the logs
// ipc.config.silent = true;

// initialize an ipc connection
ipc.connectTo(
    "server",
    function() {
        ipc.of.server.on(
            "connect",
            function() {
                ipc.log("## connected to server ##", ipc.config.delay);
            }
        );
        ipc.of.server.on(
            "disconnect",
            () => ipc.log("disconnected from the server")
        );
        ipc.of.server.on(
            "ipfs_response",
            function(data) {
                const parsed_data = JSON.parse(data);
                // TODO handle errors
                addMetadata(parsed_data.nft_id, parsed_data.metadata, DB_POOL).catch(err => process.exit(-1));
            }
        );
    }
);

// TODO add 'where' as a parameter and fetch collections
async function fetchNfts() {
    return await fetch('http://localhost:4000/graphql', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // body: JSON.stringify({query: `{ rmrkEntities (where: {block_gte: "${lastRetrievedBlock}"}, orderBy: block_DESC) { id block rmrk { caller interactionType remark rmrkVersion extraEx { call caller value } } } }`})
        // will now work if there are more nfts in a block than what was returned by the db
        // TODO do the same for fetching collections in rarity/calculate_rarity.ts as well
        body: JSON.stringify({query: `{ nfts (where: {idIndexing_gte: "${ last_id_indexing }"}, orderBy: idIndexing_ASC) { block collection id idIndexing metadata sn symbol transferable version } }`})
    })
        .then(res => res.json())
        .then(async data => {
            // if rmrk nfts are not empty
            if (data && data.data && data.data.nfts && data.data.nfts.length > 0) {
                const nfts = data.data.nfts;
                // if there is only one fetched nft and it is the lastRetrievedBlock, wait for a little bit longer
                //  because that means there are no new nfts added to the db
                if (nfts.length === 1 && nfts[0].idIndexing === last_id_indexing) {
                    WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_WAITING_FOR_NEW_RMRKS;
                } else {
                    WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_NORMAL;
                }
                // get the biggest indexing id you have retrieved
                // (which is the last nft in data, as they are ordered by ascending idIndexing number)
                last_id_indexing = nfts[nfts.length - 1].idIndexing;

                return nfts;
            }
        });
}

function isValidUrl(url: string) {
  let parsed_url;

  try {
    parsed_url = new URL(url);
  } catch (_) {
    return [ false, null ];
  }

  return [ parsed_url.protocol === "http:" || parsed_url.protocol === "https:" || parsed_url.protocol === "ipfs:", parsed_url ];
}

export async function fetchAndSaveMetadata(url: string, nft_id: string) {
    // if url is http or ipfs:
    const [valid_url, parsed_url] = isValidUrl(url);
    if(valid_url) {
        if (parsed_url.protocol === "ipfs:") {
            const pathname = parsed_url.pathname;
            const cid = pathname.split("/")[1];
            // request the metadata for object with the given cid
            ipc.of.server.emit(
                "ipfs_request",
                JSON.stringify({ nft_id: nft_id, ipfs_cid: cid })
            );
        } else {
            fetch(parsed_url)
                .then(res => res.json())
                .then(data => {
                    // TODO handle errors
                    //  what if data.metadata is null?
                    addMetadata(data.nft_id, data.metadata, DB_POOL).catch(err => process.exit(-1));
                })
        }
    }
    // otherwise throw an exception that the protocol is not recognized
    else {
        throw new URIError(`Invalid url: ${url}`);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

process.on ('SIGINT', async () => {
    console.log('Exiting');
    await saveLastRetrievedNft(lastRetrievedNft, DB_POOL);
    await DB_POOL.end();
    await ipc.disconnect("server");
    process.exit(1);
});

// fetch and save all nfts and their metadata
async function fetchAndSaveAllNftsAndMetadatas() {
    last_id_indexing = <number>(await getLastRetrievedNft(DB_POOL)).rows[0].last_retrieved_nft;
    while (true) {
        console.log("Fetching rmrk nfts from the database...");
        // TODO is await Promise.all necessary? should the nfts.map be awaited?
        await fetchNfts().then(async (nfts) => await Promise.all(nfts.map( async (nft) => {
                addNft(nft, DB_POOL).then(() => fetchAndSaveMetadata(nft.metadata, nft.id).then(() => lastRetrievedNft = last_id_indexing));
            }))
        ).catch(err => { console.error(err); process.exit(-1); });
        console.log("Fetching done\nWaiting before fetching the next batch...");
        await sleep(WAIT_BETWEEN_FETCHES);
        console.log(lastRetrievedNft)
    }
}

//fetchAllNfts().then();

// test
// fetchAndSaveMetadata("https://asdf.com", "nft_id").then(() => console.log("done"));

// first save nft with id nft_id as a test
// addNft(<Nft>{id: "nft_id", collection: "test collection"}, DB_POOL).then(() => {
//     // then save its metadata
//     fetchAndSaveMetadata("ipfs://ipfs/bafkreiac5acoaxawo7srp3rdlkdvtpnki7lfnukn6gvgv6l3cpv7mlxnrq", "nft_id").then(() => console.log("done"));
// });

//const { nfts, collections } = await consolidator.consolidate(remarks);
//
//console.log(nfts, collections);

fetchAndSaveAllNftsAndMetadatas().then();
