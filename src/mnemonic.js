"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require('crypto');
const en_1 = require("./wordList/en");
function fromEntropy(entropy) {
    const sizes = [16, 20, 24, 28, 32];
    const length = entropy.length;
    if (sizes.indexOf(length) === -1) {
        // TODO: ERR
        throw new Error('');
    }
    const checksumBits = length / 4;
    const mask = (1 << checksumBits) - 1;
    let sha2sum = crypto.createHash('sha256')
        .update(Buffer.from(entropy))
        .digest();
    const hash = [...sha2sum];
    let checksum = (hash[0] >> 8 - checksumBits) & mask;
    const nwords = (length * 8 + checksumBits) / 11;
    const indexes = new Array(nwords).fill(0);
    let loc = 0;
    for (let byte of entropy) {
        for (let i = 7; i >= 0; i--) {
            const bit = (byte & (1 << i)) !== 0;
            indexes[Math.floor(loc / 11)] |= Number(bit) << (10 - (loc % 11));
            loc += 1;
        }
    }
    for (let i = checksumBits - 1; i >= 0; i--) {
        const bit = (checksum & (1 << i)) !== 0;
        indexes[Math.floor(loc / 11)] |= Number(bit) << (10 - (loc % 11));
        loc += 1;
    }
    return indexes.map(i => en_1.default[i]);
}
exports.fromEntropy = fromEntropy;
function toEntropy(mnemonic) {
    const sizes = [16, 20, 24, 28, 32];
    const length = mnemonic.length;
    if (sizes.indexOf(length) === -1) {
        // TODO: ERR
        throw new Error('');
    }
    let indexes = mnemonic.map(word => en_1.default.indexOf(word));
    let checksumBits = mnemonic.length / 3;
    let mask = (1 << checksumBits) - 1;
    let last = indexes.pop();
    let checksum = (last || 0) & mask;
    const datalen = ((11 * length) - checksumBits) / 8 - 1;
    let entropy = new Array(datalen).fill(0);
    // set the last byte to the data part of the last word
    entropy.push((last || 0) >> checksumBits);
    // start setting bits from this index
    let loc = 11 - checksumBits;
    // cast vector of u11 as u8
    for (let index of indexes.reverse()) {
        for (let i = 0; i < 11; i++) {
            const bit = (index & (1 << i)) !== 0;
            const ei = datalen - Math.floor(loc / 8);
            const ret = Number(bit) << (loc % 8);
            entropy[ei < 0 ? 0 : ei] |= ret;
            loc += 1;
        }
    }
    let sha2sum = crypto.createHash('sha256')
        .update(Buffer.from(entropy))
        .digest();
    const hash = [...sha2sum];
    let actual = (hash[0] >> (8 - checksumBits)) & mask;
    if (actual !== checksum) {
        throw new Error('');
    }
    return Buffer.from(entropy);
}
exports.toEntropy = toEntropy;
