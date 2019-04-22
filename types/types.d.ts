/// <reference types="node" />
import { ChainTypes } from './global';
export interface WalletConfig {
    chainType: ChainTypes | null;
    apiListenInterface: string;
    apiListenPort: number;
    ownerApiListenPort: number | null;
    apiSecretPath: string | null;
    nodeApiSecretPath: string | null;
    checkNodeApiHttpAddr: string;
    ownerApiIncludeForeign: boolean | null;
    dataFileDir: string;
    noCommitCache: boolean | null;
    tlsCertificateFile: string | null;
    tlsCertificateKey: string | null;
    darkBackgroundColorScheme: boolean | null;
    keybaseNotifyTtl: number | null;
}
export declare const defaultConfig: WalletConfig;
export interface WalletSeedInterface {
    init(recoveryPhrase: string | null, password: string): EncryptedWalletSeedInterface;
}
export declare class WalletSeed implements WalletSeedInterface {
    private seed;
    constructor(seedLength: number);
    init(password: string, recoveryPhrase: string | null): EncryptedWalletSeedInterface;
    fromMnemonic(recoveryPhrase: string): Buffer;
    toMnemonic(): string[];
}
export interface EncryptedWalletSeedInterface {
    encryptedSeed: string;
    salt: string;
    nonce: string;
}
export declare class EncryptedWalletSeed implements EncryptedWalletSeedInterface {
    encryptedSeed: string;
    salt: string;
    nonce: string;
    constructor(encryptedSeed: string, salt: string, nonce: string);
    static from_seed(seed: Buffer, password?: string): EncryptedWalletSeedInterface;
}
