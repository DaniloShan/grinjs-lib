"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_1 = require("../global");
var WalletConfig;
(function (WalletConfig) {
    function Default() {
        return {
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
    }
    WalletConfig.Default = Default;
})(WalletConfig || (WalletConfig = {}));
class WalletSeed {
    constructor(seed) { }
    initFile(walletConfig, seedLength, recoveryPhrase, password) {
        return new WalletSeed(this.seed);
    }
}
exports.WalletSeed = WalletSeed;
