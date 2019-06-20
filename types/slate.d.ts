import { SlateInterface, EncryptedWalletSeedInterface, UTXOInterface, IdInterface } from './types';
export declare class Slate {
    build: SlateInterface;
    wallet: EncryptedWalletSeedInterface;
    constructor(amount: number, height: number, wallet: EncryptedWalletSeedInterface);
    withFee(fee: number): Slate;
    withLockHeight(lockHeight: number): Slate;
    coinbaseInput(utxo: UTXOInterface): Slate;
    input(utxo: UTXOInterface): Slate;
    output(amount: number, index: IdInterface): void;
    addTransactionElements(utxoList: UTXOInterface[], fee: number): {
        positiveKeyIds: {
            value: number;
            extKeychainPath: {
                depth: number;
                path: {
                    index: number;
                }[];
            };
        }[];
        negativeKeyIds: {
            value: number;
            extKeychainPath: IdInterface;
        }[][];
        positiveBlindingFactors: never[];
        negativeBlindingFactors: never[];
    };
}
