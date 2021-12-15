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
    // silent the logs
    // ipc.config.silent = true;

    // TODO tcp or udp
    ipc.serve(
        function(){
            ipc.server.on(
                "ipfs_request",
                async function(ipfs_cid, socket){
                    ipc.log('got a request for ipfs cid: ', ipfs_cid);
                    const data = uint8ArrayConcat(await all(node.cat(ipfs_cid)));
                    ipc.server.emit(
                        socket,
                        "ipfs_response",
                        uint8ArrayToString(data)
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
    process.exit(1);
});

startIPCServerAndIPFSNode().then();
