import { Nft } from '../generated/model/index';
import fetch from 'node-fetch';
import ipc from 'node-ipc';

const WAIT_BETWEEN_FETCHES_NORMAL = 2 * 1000;                         // how long to wait between fetches of rmrks from the database to not overload the db with requests normally
const WAIT_BETWEEN_FETCHES_WAITING_FOR_NEW_RMRKS = 1 * 60 * 1000;     // how long to wait between fetches of rmrks when the last fetched rmrk was not new (so no new rmrks were saved in the db between the last 2 requests)


let lastRetrievedBlock = 0;
let WAIT_BETWEEN_FETCHES = WAIT_BETWEEN_FETCHES_NORMAL;

ipc.config.id   = "client";
ipc.config.retry= 1500;

// TODO add 'where' as a parameter and fetch collections
async function fetchNfts() {
    return await fetch('http://localhost:4000/graphql', {
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
            // if rmrk nfts are not empty
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

export async function fetchMetadata(url: string) {
    // if url is http or ipfs:
    const [valid_url, parsed_url] = isValidUrl(url);
    if(valid_url) {
        if (parsed_url.protocol === "ipfs:") {
            const pathname = parsed_url.pathname;
            const cid = pathname.split("/")[1];
            // TODO for some reason this program does not exit because of the ipfs node
            // TODO create a separate process that will start an ipfs node, and query it from here,
            //  instead of creating a node here
            ipc.connectTo(
                "server",
                function() {
                    ipc.of.server.on(
                        "connect",
                        function() {
                            ipc.log("## connected to server ##", ipc.config.delay);
                            ipc.of.server.emit(
                                "ipfs_request",
                                cid
                            );
                        }
                    );
                    ipc.of.server.on(
                        "disconnect",
                        () => ipc.log("disconnected from the server")
                    );
                    ipc.of.server.on(
                        "ipfs_response",
                        function(metadata) {
                            ipc.log("got a the metadata from the server: ", metadata);
                        }
                    );
                }
            );
        } else {
            // TODO fetch http url
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

process.on ('SIGINT',() => {
    console.log('Exiting');
    process.exit(1);
});

async function fetchAllNfts() {
    while (true) {
        console.log("Fetching rmrk nfts from the database...");
        await fetchNfts().then(nfts => nfts.map(nft => console.log(nft.metadata)));
        console.log("Fetching done\nWaiting before fetching the next batch...");
        await sleep(WAIT_BETWEEN_FETCHES);
        console.log(lastRetrievedBlock)
    }
}

//fetchAllNfts().then();

// test
fetchMetadata("https://asdf.com").then(() => console.log("done"));
fetchMetadata("ipfs://ipfs/bafkreiac5acoaxawo7srp3rdlkdvtpnki7lfnukn6gvgv6l3cpv7mlxnrq").then(() => console.log("done"));

//const { nfts, collections } = await consolidator.consolidate(remarks);
//
//console.log(nfts, collections);
