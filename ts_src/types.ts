const crypto = require('crypto');
import { ChainTypes } from './global';
import { fromEntropy } from './mnemonic';

export interface WalletConfig {
    chainType: ChainTypes | null,
    apiListenInterface: string,
    apiListenPort: number,
    ownerApiListenPort: number | null,
    apiSecretPath: string | null,
    nodeApiSecretPath: string | null,
    checkNodeApiHttpAddr: string,
    ownerApiIncludeForeign: boolean | null,
    dataFileDir: string,
    noCommitCache: boolean | null,
    tlsCertificateFile: string | null,
    tlsCertificateKey: string | null,
    darkBackgroundColorScheme: boolean | null,
    keybaseNotifyTtl: number | null
}

export const defaultConfig: WalletConfig = {
    chainType: ChainTypes.Mainnet,
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

export interface WalletSeedInterface {
    init(recoveryPhrase: string | null, password: string): EncryptedWalletSeedInterface;
}

export class WalletSeed implements WalletSeedInterface {
    private seed: Buffer;
    constructor(seedLength: number){
        this.seed = crypto.randomBytes(seedLength);
    }

    init(password: string, recoveryPhrase: string | null): EncryptedWalletSeedInterface {
        this.seed = recoveryPhrase ? this.fromMnemonic(recoveryPhrase) : this.seed;
        return EncryptedWalletSeed.from_seed(this.seed, password);
    }

    fromMnemonic(recoveryPhrase: string): Buffer {
        // todo: real code
        console.log(recoveryPhrase);
        return crypto.randomBytes(12)
    }

    toMnemonic(): string[] {
        return fromEntropy([...this.seed])
    }
}

export interface EncryptedWalletSeedInterface {
    encryptedSeed: string,
    salt: string,
    nonce: string
}

export class EncryptedWalletSeed implements EncryptedWalletSeedInterface {
    encryptedSeed: string;
    salt: string;
    nonce: string;

    constructor(encryptedSeed: string, salt: string, nonce: string) {
        this.encryptedSeed = encryptedSeed;
        this.salt = salt;
        this.nonce = nonce;
    }

    public static from_seed(seed: Buffer, password: string = ''): EncryptedWalletSeedInterface {
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
        return new EncryptedWalletSeed(encryptedSeed + tag, salt.toString('hex'), nonce.toString('hex'))
    }
}
