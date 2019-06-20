"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_1 = require("./global");
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
var UTXOStatus;
(function (UTXOStatus) {
    UTXOStatus["Unconfirmed"] = "Unconfirmed";
    UTXOStatus["Unspent"] = "Unspent";
    UTXOStatus["Locked"] = "Locked";
    UTXOStatus["Spent"] = "Spent";
})(UTXOStatus = exports.UTXOStatus || (exports.UTXOStatus = {}));
