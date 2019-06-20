import { UTXOInterface, EncryptedWalletSeedInterface, TXInterface } from './types';
import { Slate } from './slate';
import { ChainTypes } from './global';
export declare class Transaction implements TXInterface {
    init(amount: number, height: number, utxoList: UTXOInterface[], wallet: EncryptedWalletSeedInterface, index: number, changeLength?: number, minimumConfirmations?: number, useAll?: boolean): import("./types").SlateInterface;
    addInputsToSlate(utxoList: UTXOInterface[], wallet: EncryptedWalletSeedInterface, slate: Slate, changeLength: number, minimumConfirmations: number, useAll: boolean, index: number): void;
    buildSendTx(utxoListFromArgs: UTXOInterface[], wallet: EncryptedWalletSeedInterface, slate: Slate, changeLength: number, minimumConfirmations: number, useAll: boolean, index: number): void;
    selectSendTx(utxoListFromArgs: UTXOInterface[], wallet: EncryptedWalletSeedInterface, slate: Slate, minimumConfirmations: number, changeLength: number, useAll: boolean, index: number): {
        utxoList: UTXOInterface[];
        changeAmountsDerivations: {
            changeAmount: number;
            changeKey: import("./types").IdInterface;
        }[];
        fee: number;
    };
    selectCoinsAndFee(utxoListFromArgs: UTXOInterface[], wallet: EncryptedWalletSeedInterface, amount: number, currentHeight: number, minimumConfirmations: number, changeLength: number, useAll: boolean): {
        utxoList: UTXOInterface[];
        total: number;
        amount: number;
        fee: number;
    };
    calculateMaxInputsInBlock(numOutputs: number, chainType: ChainTypes): number;
    selectCoins(utxoList: UTXOInterface[], amount: number, height: number, minimumConfirmations: number, maxOutputs: number, useAll: boolean): {
        maxAvailable: number;
        utxoList: UTXOInterface[];
    };
    selectFrom(amount: number, utxoList: UTXOInterface[], useAll: boolean): UTXOInterface[];
    txFee(inputLen: number, outputLen: number, kernelLen: number, baseFee?: number): number;
    inputsAndChange(slate: Slate, utxoList: UTXOInterface[], wallet: EncryptedWalletSeedInterface, amount: number, fee: number, changeLength: number, index: number): {
        changeAmount: number;
        changeKey: import("./types").IdInterface;
    }[];
    totalValue(utxoList: UTXOInterface[]): number;
}
