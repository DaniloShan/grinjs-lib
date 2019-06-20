const crypto = require('crypto');
const blake2b = require('blake2b');
const Secp = require('secp256k1-zkp');
const secp = new Secp();
import {
    WalletConfig,
    WalletInterface,
    EncryptedWalletSeedInterface,
    defaultConfig,
    WalletSeedInterface,
    IdInterface
} from './types';
import { Network, floonet, mainnet } from './networks';
import { fromEntropy, toEntropy } from './mnemonic';
import { idToPath } from './global';
import { SECRET_KEY_SEED } from './global';

class WalletSeed implements WalletSeedInterface {
    private seed: Buffer;
    config: WalletConfig;

    constructor(seedLength: number, config: WalletConfig = defaultConfig){
        this.seed = crypto.randomBytes(seedLength);
        this.config = config;
    }

    init(password: string, recoveryPhrase: string[] | null): EncryptedWalletSeedInterface {
        this.seed = recoveryPhrase && recoveryPhrase.length ? this.fromMnemonic(recoveryPhrase) : this.seed;
        return Object.assign(EncryptedWalletSeed.fromSeed(this.seed, password), {
            config: this.config
        })
    }

    fromMnemonic(recoveryPhrase: string[]): Buffer {
        this.seed = toEntropy(recoveryPhrase);
        return this.seed;
    }

    toMnemonic(): string[] {
        return fromEntropy([...this.seed])
    }
}

export class Wallet implements WalletInterface {
    network: Network;
    walletConfig: WalletConfig | {};

    constructor(walletConfig: WalletConfig = defaultConfig, isTestnet = false) {
        this.network = isTestnet ? floonet : mainnet;
        this.walletConfig = walletConfig;
    }

    init(password: string, recoveryPharse: string[] | null, seedLength: number = 32)
        : {
        wallet: EncryptedWalletSeedInterface,
        mnemonic: string[]
    } {
        const newWallet = new WalletSeed(seedLength);
        const wallet = newWallet.init(password, recoveryPharse);

        return { wallet, mnemonic: newWallet.toMnemonic() };
    }
}

const secretKeySymbol = Symbol('secretKey');
const chainCodeSymbol = Symbol('chainCode');
class EncryptedWalletSeed implements EncryptedWalletSeedInterface {
    encryptedSeed: string;
    salt: string;
    nonce: string;
    [secretKeySymbol]: Buffer;
    [chainCodeSymbol]: Buffer;
    config: WalletConfig = defaultConfig;
    parentKey: IdInterface = idToPath(Buffer.from('0200000000000000000000000000000000', 'hex'));
    rootKey: IdInterface = idToPath(Buffer.from('0000000000000000000000000000000000', 'hex'));

    constructor(encryptedSeed: string, salt: string, nonce: string, secretKey: Buffer, chainCode: Buffer) {
        this.encryptedSeed = encryptedSeed;
        this.salt = salt;
        this.nonce = nonce;

        this[secretKeySymbol] = secretKey;
        this[chainCodeSymbol] = chainCode;
    }

    get secretKey() {
        return this[secretKeySymbol]
    }

    get chainCode() {
        return this[chainCodeSymbol]
    }

    public static fromSeed(seed: Buffer, password: string = ''): EncryptedWalletSeedInterface {
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

        const hmac = crypto.createHmac('sha512', SECRET_KEY_SEED);
        hmac.update(seed);
        const result = hmac.digest();
        return new EncryptedWalletSeed(encryptedSeed + tag,
            salt.toString('hex'),
            nonce.toString('hex'),
            Buffer.from(result.slice(0, 32)),
            Buffer.from(result.slice(32))
        )
    }

    deriveKey(amount: number, id: IdInterface) {
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

    ckdPriv(chainCode: Buffer, secretKey: Buffer, beN: Buffer = Buffer.from([0, 0, 0, 0])): Buffer {
        const publicKey: Buffer = secp.pubKeyFromSecretKey(secretKey);
        const hMac = crypto.createHmac('sha512', chainCode);
        hMac.update(secp.pubKeySerialize(publicKey));
        hMac.update(beN);
        return hMac.digest();
    }

    nextChild(index: number = -1) {
        const parentKey = this.parentKey;
        parentKey.depth += 1;
        parentKey.path[2].index = index + 2;

        return parentKey;
    }

    createNonce(commit: Buffer): Buffer {
        const rootKey = this.deriveKey(0, this.rootKey);
        const h = blake2b(32, commit);
        h.update(rootKey);
        const nonce = h.digest('hex');
        console.log('commit: ', commit);
        console.log('nonce: ', nonce);
        return Buffer.from(nonce, 'hex');
    }
}
