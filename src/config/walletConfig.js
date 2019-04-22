"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rng = require('randombytes');
const global_1 = require("../global");
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
    constructor(seed) {
        this.seed = seed;
    }
    initFile(walletConfig, seedLength, recoveryPhrase, password) {
        console.log(walletConfig, password);
        this.seed = recoveryPhrase ? this.fromMnemonic(recoveryPhrase) : this.initNew(seedLength);
        return new WalletSeed(this.seed);
    }
    fromMnemonic(recoveryPhrase) {
        // todo: real code
        console.log(recoveryPhrase);
        return [123];
    }
    initNew(seedLength) {
        let seed = rng(seedLength);
        return seed;
    }
}
exports.WalletSeed = WalletSeed;
