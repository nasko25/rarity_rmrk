import ipc from 'node-ipc';
const ipfs = require("ipfs");
const all = require('it-all');
const { concat: uint8ArrayConcat } = require('uint8arrays/concat');
const { toString: uint8ArrayToString } = require('uint8arrays/to-string');

let node;
async function startIPCServerAndIPFSNode() {
    node = await ipfs.create();
    // const data = uint8ArrayConcat(await all(node.cat(cid)));
    // console.log(uint8ArrayToString(data));

    // TODO https://www.npmjs.com/package/node-ipc#types-of-ipc-sockets
    ipc.config.id = "server";
    ipc.config.retry = 1500;

    // TODO tcp or udp
    ipc.serve(
        function(){
            ipc.server.on(
                "ipfs_request",
                function(data, socket){
                    ipc.log('got a request for ipfs cid: ', data);
                    ipc.server.emit(
                        socket,
                        "ipfs_response",
                        "fetched metadata"
                    );
                }
            );
            ipc.server.on(
                "socket.disconnected",
                function(socket, destroyedSocketID) {
                    ipc.log("client " + destroyedSocketID + " has disconnected!");
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
    process.exit(1);
});

startIPCServerAndIPFSNode().then();
