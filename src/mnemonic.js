"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require('crypto');
const en_1 = require("./wordList/en");
function fromEntropy(entropy) {
    const sizes = [16, 20, 24, 28, 32];
    const length = entropy.length;
    if (sizes.indexOf(length) === -1) {
        // TODO: ERR
        return [''];
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
