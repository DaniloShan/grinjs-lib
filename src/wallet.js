"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const networks_1 = require("./networks");
class Wallet {
    constructor(walletConfig = types_1.defaultConfig, isTestnet = false) {
        this.encSeed = new types_1.EncryptedWalletSeed('', '', '');
        this.network = isTestnet ? networks_1.floonet : networks_1.mainnet;
        this.walletConfig = walletConfig;
    }
    init(password, seedLength = 32, recoveryPharse) {
        const newWallet = new types_1.WalletSeed(seedLength);
        this.encSeed = newWallet.init(password, recoveryPharse);
        return { encSeed: this.encSeed, mnemonic: newWallet.toMnemonic() };
    }
}
exports.Wallet = Wallet;
