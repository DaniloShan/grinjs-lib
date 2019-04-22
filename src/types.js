"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require('crypto');
const global_1 = require("./global");
const mnemonic_1 = require("./mnemonic");
exports.defaultConfig = {
    chainType: global_1.ChainTypes.Mainnet,
    apiListenInterface: "127.0.0.1",
    apiListenPort: 3415,
    ownerApiListenPort: 3420,
    apiSecretPath: ".api_secret",
    nodeApiSecretPath: ".api_secret",
    checkNodeApiHttpAddr: "http://127.0.0.1:3413",
    ownerApiIncludeForeign: false,
    dataFileDir: ".",
    noCommitCache: false,
    tlsCertificateFile: null,
    tlsCertificateKey: null,
    darkBackgroundColorScheme: true,
    keybaseNotifyTtl: 1440
};
class WalletSeed {
    constructor(seedLength) {
        this.seed = crypto.randomBytes(seedLength);
    }
    init(password, recoveryPhrase) {
        this.seed = recoveryPhrase && recoveryPhrase.length ? this.fromMnemonic(recoveryPhrase) : this.seed;
        return EncryptedWalletSeed.from_seed(this.seed, password);
    }
    fromMnemonic(recoveryPhrase) {
        this.seed = mnemonic_1.toEntropy(recoveryPhrase);
        return this.seed;
    }
    toMnemonic() {
        return mnemonic_1.fromEntropy([...this.seed]);
    }
}
exports.WalletSeed = WalletSeed;
class EncryptedWalletSeed {
    constructor(encryptedSeed, salt, nonce) {
        this.encryptedSeed = encryptedSeed;
        this.salt = salt;
        this.nonce = nonce;
    }
    static from_seed(seed, password = '') {
        const salt = crypto.randomBytes(8);
        const nonce = crypto.randomBytes(12);
        const key = crypto.pbkdf2Sync(password, salt, 100, 32, 'sha512');
        const encBytes = seed.toString('hex');
        const cipher = crypto.createCipheriv('chacha20-poly1305', Buffer.from(key, 'hex'), nonce, {
            authTagLength: 16
        });
        const encryptedSeed = cipher.update(Buffer.from(encBytes, 'hex')).toString('hex');
        cipher.final();
        const tag = cipher.getAuthTag().toString('hex');
        return new EncryptedWalletSeed(encryptedSeed + tag, salt.toString('hex'), nonce.toString('hex'));
    }
}
exports.EncryptedWalletSeed = EncryptedWalletSeed;
