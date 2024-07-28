"use strict";

import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { getRandomBytesSync } from "ethereum-cryptography/random.js"


function hashMessage(message) {
    return keccak256(utf8ToBytes(message));
}
  
async function signMessage(msg, privateKey) {
    return secp256k1.sign(hashMessage(msg), privateKey);
}

function getNonce( ) {
    return getRandomBytesSync(32);
}

export { hashMessage, signMessage, getNonce }