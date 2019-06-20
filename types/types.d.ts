/// <reference types="node" />
import { Network } from './networks';
import { ChainTypes } from './global';
export interface WalletConfig {
    chainType: ChainTypes;
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
    init(password: string, recoveryPhrase: string[] | null): EncryptedWalletSeedInterface;
}
export interface WalletInterface {
    network: Network;
    walletConfig: WalletConfig | {};
}
export interface EncryptedWalletSeedInterface {
    encryptedSeed: string;
    salt: string;
    nonce: string;
    config: WalletConfig;
    nextChild(index: number): IdInterface;
    deriveKey(amount: number, id: IdInterface): Buffer;
    createNonce(commit: Buffer): Buffer;
}
export interface UTXOInterface {
    height: number;
    value: number;
    isCoinbase: boolean;
    keyId: Buffer;
    commit: Buffer;
}
export declare enum UTXOStatus {
    Unconfirmed = "Unconfirmed",
    Unspent = "Unspent",
    Locked = "Locked",
    Spent = "Spent"
}
export interface SlateInterface {
    numParticipants: number;
    id: string;
    tx: {
        offset: string;
        body: {
            inputs: {
                features: string;
                commit: string;
            }[];
            outputs: {
                features: "Plain";
                commit: string;
                proof: string;
            }[];
            kernels: {
                features: string;
                fee: number;
                lockHeight: number;
                excess: string;
                excessSig: string;
            }[];
        };
    };
    amount: number;
    fee: number;
    height: number;
    lockHeight: number;
    participantData: {
        id: number;
        publicBlindExcess: string;
        publicNonce: string;
        partSig: null;
        message: null;
        messageSig: null;
    }[];
    version: number;
}
export interface IdInterface {
    depth: number;
    path: {
        index: number;
    }[];
}
export interface TXInterface {
    init(amount: number, height: number, utxoList: UTXOInterface[], wallet: EncryptedWalletSeedInterface, index: number, changeLength: number, minimumConfirmations: number, useAll: boolean): void;
}
