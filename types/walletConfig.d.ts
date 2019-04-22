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
    seed: number[];
    initFile(walletConfig: WalletConfig, seedLength: number, recoveryPhrase: string | null, password: string): WalletSeedInterface;
}
export declare class WalletSeed implements WalletSeedInterface {
    seed: number[];
    constructor(seed: number[]);
    initFile(walletConfig: WalletConfig, seedLength: number, recoveryPhrase: string | null, password: string): WalletSeedInterface;
    fromMnemonic(recoveryPhrase: string): number[];
    initNew(seedLength: number): number[];
}
