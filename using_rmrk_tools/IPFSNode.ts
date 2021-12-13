import ipc from 'node-ipc';
const IPFS = require("ipfs");
const all = require('it-all');
const { concat: uint8ArrayConcat } = require('uint8arrays/concat');
const { toString: uint8ArrayToString } = require('uint8arrays/to-string');

const node = await IPFS.create();
const data = uint8ArrayConcat(await all(node.cat(cid)));
console.log(uint8ArrayToString(data));

// TODO https://www.npmjs.com/package/node-ipc#types-of-ipc-sockets

process.on ('SIGINT',() => {
    console.log("Stopping ipfs node and ipc server");
    node.stop();
    console.log("ipfs node and ipc server are stopped\nExiting...\n")
    process.exit(1);
});
