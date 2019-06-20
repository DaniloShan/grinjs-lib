"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require('crypto');
const blake2b = require('blake2b');
const Secp = require('secp256k1-zkp');
const secp = new Secp();
const types_1 = require("./types");
const networks_1 = require("./networks");
const mnemonic_1 = require("./mnemonic");
const global_1 = require("./global");
const global_2 = require("./global");
class WalletSeed {
    constructor(seedLength, config = types_1.defaultConfig) {
        this.seed = crypto.randomBytes(seedLength);
        this.config = config;
    }
    init(password, recoveryPhrase) {
        this.seed = recoveryPhrase && recoveryPhrase.length ? this.fromMnemonic(recoveryPhrase) : this.seed;
        return Object.assign(EncryptedWalletSeed.fromSeed(this.seed, password), {
            config: this.config
        });
    }
    fromMnemonic(recoveryPhrase) {
        this.seed = mnemonic_1.toEntropy(recoveryPhrase);
        return this.seed;
    }
    toMnemonic() {
        return mnemonic_1.fromEntropy([...this.seed]);
    }
}
class Wallet {
    constructor(walletConfig = types_1.defaultConfig, isTestnet = false) {
        this.network = isTestnet ? networks_1.floonet : networks_1.mainnet;
        this.walletConfig = walletConfig;
    }
    init(password, recoveryPharse, seedLength = 32) {
        const newWallet = new WalletSeed(seedLength);
        const wallet = newWallet.init(password, recoveryPharse);
        return { wallet, mnemonic: newWallet.toMnemonic() };
    }
}
exports.Wallet = Wallet;
const secretKeySymbol = Symbol('secretKey');
const chainCodeSymbol = Symbol('chainCode');
class EncryptedWalletSeed {
    constructor(encryptedSeed, salt, nonce, secretKey, chainCode) {
        this.config = types_1.defaultConfig;
        this.parentKey = global_1.idToPath(Buffer.from('0200000000000000000000000000000000', 'hex'));
        this.rootKey = global_1.idToPath(Buffer.from('0000000000000000000000000000000000', 'hex'));
        this.encryptedSeed = encryptedSeed;
        this.salt = salt;
        this.nonce = nonce;
        this[secretKeySymbol] = secretKey;
        this[chainCodeSymbol] = chainCode;
    }
    get secretKey() {
        return this[secretKeySymbol];
    }
    get chainCode() {
        return this[chainCodeSymbol];
    }
    static fromSeed(seed, password = '') {
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
        const hmac = crypto.createHmac('sha512', global_2.SECRET_KEY_SEED);
        hmac.update(seed);
        const result = hmac.digest();
        return new EncryptedWalletSeed(encryptedSeed + tag, salt.toString('hex'), nonce.toString('hex'), Buffer.from(result.slice(0, 32)), Buffer.from(result.slice(32)));
    }
    deriveKey(amount, id) {
        let secretKey = this.secretKey;
        let chainCode = this.chainCode;
        for (let i = 0; i < id.depth; i++) {
            const beN = [0, 0, 0, id.path[i].index];
            const res = this.ckdPriv(chainCode, secretKey, Buffer.from(beN));
            secretKey = secp.secretKeyAdd(secretKey, res.slice(0, 32));
            chainCode = res.slice(32);
        }
        return secp.blindSwitch(amount, secretKey);
    }
    ckdPriv(chainCode, secretKey, beN = Buffer.from([0, 0, 0, 0])) {
        const publicKey = secp.pubKeyFromSecretKey(secretKey);
        const hMac = crypto.createHmac('sha512', chainCode);
        hMac.update(secp.pubKeySerialize(publicKey));
        hMac.update(beN);
        return hMac.digest();
    }
    nextChild(index = -1) {
        const parentKey = this.parentKey;
        parentKey.depth += 1;
        parentKey.path[2].index = index + 2;
        return parentKey;
    }
    createNonce(commit) {
        const rootKey = this.deriveKey(0, this.rootKey);
        const h = blake2b(32, commit);
        h.update(rootKey);
        const nonce = h.digest('hex');
        console.log('commit: ', commit);
        console.log('nonce: ', nonce);
        return Buffer.from(nonce, 'hex');
    }
}
