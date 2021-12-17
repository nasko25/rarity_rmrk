import ipc from 'node-ipc';
const ipfs = require("ipfs");
const all = require('it-all');
const { concat: uint8ArrayConcat } = require('uint8arrays/concat');
const { toString: uint8ArrayToString } = require('uint8arrays/to-string');
require('dotenv').config();

let node;
async function startIPCServerAndIPFSNode() {
    node = await ipfs.create();
    // const data = uint8ArrayConcat(await all(node.cat(cid)));
    // console.log(uint8ArrayToString(data));

    ipc.config.id = "server";
    ipc.config.retry = 1500;
    // silent the logs
    // ipc.config.silent = true;

    // TODO tcp or udp
    ipc.serve(
        function(){
            ipc.server.on(
                "ipfs_request",
                async function(data, socket){
                    const parsed_data = JSON.parse(data);
                    ipc.log('got a request for ipfs cid: ', parsed_data.ipfs_cid, "; for an nft with id: ", parsed_data.nft_id);
                    const metadata = uint8ArrayConcat(await all(node.cat(parsed_data.ipfs_cid)));
                    ipc.server.emit(
                        socket,
                        "ipfs_response",
                        JSON.stringify({ nft_id: parsed_data.nft_id, metadata: uint8ArrayToString(metadata) })
                    );
                }
            );
            ipc.server.on(
                "socket.disconnected",
                function(socket, socket_id) {
                    ipc.log("client " + socket_id + " has disconnected!");
                }
            );
        }
    );

    ipc.server.start();
}

process.on ('SIGINT', async () => {
    if (node) { console.log("Stopping ipfs node..."); await node.stop(); }
    console.log("Stopping ipc server...");
    await ipc.server.stop();
    console.log("ipfs node and ipc server are stopped\nExiting...\n")
    // for some reason this program does not exit because of the ipfs node
    // so call process.exit() manually to exit the progeam
    process.exit(1);
});

console.log(process.env.DB_NAME);
startIPCServerAndIPFSNode().then();
