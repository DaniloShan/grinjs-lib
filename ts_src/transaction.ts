import {
    UTXOInterface,
    EncryptedWalletSeedInterface,
    TXInterface
} from './types';
import { Slate } from './slate';
import { ChainTypes, Consensus, MaxBlockWeight, DEFAULT_BASE_FEE, toBuffer } from './global';

export class Transaction implements TXInterface {
    // TODO: tx index
    init(
        amount: number,
        height: number,
        utxoList: UTXOInterface[],
        wallet: EncryptedWalletSeedInterface,
        index: number,
        changeLength: number = 1,
        minimumConfirmations: number = 10,
        useAll: boolean = true,
        // message: string = ''
    ) {
        const slate = new Slate(amount, height, wallet);
        this.addInputsToSlate(
            utxoList.map(utxo => (Object.assign(utxo, {
                keyId: toBuffer(utxo.keyId),
                commit: toBuffer(utxo.commit)
            }))),
            wallet,
            slate,
            changeLength,
            minimumConfirmations,
            useAll,
            index
            // 0,
            // message
        );
        return slate.build;
    }

    addInputsToSlate(
        utxoList: UTXOInterface[],
        wallet: EncryptedWalletSeedInterface,
        slate: Slate,
        changeLength: number,
        minimumConfirmations: number,
        useAll: boolean,
        index: number
        // participantId: number,
        // message: string
    ) {
        this.buildSendTx(
            utxoList,
            wallet,
            slate,
            changeLength,
            minimumConfirmations,
            useAll,
            index
        );
    }

    buildSendTx(
        utxoListFromArgs: UTXOInterface[],
        wallet: EncryptedWalletSeedInterface,
        slate: Slate,
        changeLength: number,
        minimumConfirmations: number,
        useAll: boolean,
        index: number
    ) {
        const { utxoList, changeAmountsDerivations, fee } = this.selectSendTx(
            utxoListFromArgs,
            wallet,
            slate,
            minimumConfirmations,
            changeLength,
            useAll,
            index
        );

        const blinding = slate.addTransactionElements(utxoList, fee);
        console.log(blinding);
        console.log(changeAmountsDerivations);
        console.log('tx: ', JSON.stringify(slate.build));
    }

    selectSendTx(
        utxoListFromArgs: UTXOInterface[],
        wallet: EncryptedWalletSeedInterface,
        slate: Slate,
        minimumConfirmations: number,
        changeLength: number,
        useAll: boolean,
        index: number
    ) {
        const { utxoList, fee, amount } = this.selectCoinsAndFee(
            utxoListFromArgs,
            wallet,
            slate.build.amount,
            slate.build.height,
            minimumConfirmations,
            changeLength,
            useAll
        );

        // build transaction skeleton with inputs and change
        const changeAmountsDerivations = this.inputsAndChange(
            slate,
            utxoList,
            wallet,
            amount,
            fee,
            changeLength,
            index
        );
        slate.withLockHeight(slate.build.lockHeight);

        return {
            utxoList,
            changeAmountsDerivations,
            fee
        }
    }

    selectCoinsAndFee(
        utxoListFromArgs: UTXOInterface[],
        wallet: EncryptedWalletSeedInterface,
        amount: number,
        currentHeight: number,
        minimumConfirmations: number,
        changeLength: number,
        useAll: boolean
    ) {
        let { maxAvailable, utxoList } = this.selectCoins(
            utxoListFromArgs,
            amount,
            currentHeight,
            minimumConfirmations,
            this.calculateMaxInputsInBlock(changeLength, wallet.config.chainType),
            useAll
        );

        let fee = this.txFee(utxoList.length, 1, 1);
        let total = this.totalValue(utxoList);
        let amountWithFee = amount + fee;

        if (total === 0) {
            throw new Error('Not enough funds');
        }
        if (total < amountWithFee && utxoList.length === maxAvailable) {
            throw new Error('Not enough funds');
        }

        const numOutputs = changeLength + 1;

        // We need to add a change address or amount with fee is more than total
        if (total !== amountWithFee) {
            fee = this.txFee(utxoList.length, numOutputs, 1);
            amountWithFee = amount + fee;

            // Here check if we have enough outputs for the amount including fee otherwise
            // look for other outputs and check again
            while (total < amountWithFee) {
                // End the loop if we have selected all the outputs and still not enough funds
                if (utxoList.length === maxAvailable) {
                    throw new Error('Not enough funds');
                }

                // select some spendable coins from the wallet
                const coins = this.selectCoins(
                    utxoList,
                    amountWithFee,
                    currentHeight,
                    minimumConfirmations,
                    this.calculateMaxInputsInBlock(numOutputs, wallet.config.chainType),
                    useAll
                );
                utxoList = coins.utxoList;
                fee = this.txFee(utxoList.length, numOutputs, 1);
                total = this.totalValue(utxoList);
                amountWithFee = amount + fee;
            }
        }

        return { utxoList, total, amount, fee }
    }

    calculateMaxInputsInBlock(numOutputs: number, chainType: ChainTypes): number {
        const coinbaseWeight = Consensus.BLOCK_OUTPUT_WEIGHT + Consensus.BLOCK_KERNEL_WEIGHT;
        return (
            MaxBlockWeight[chainType] - (coinbaseWeight +
                Consensus.BLOCK_OUTPUT_WEIGHT * numOutputs +
                Consensus.BLOCK_KERNEL_WEIGHT)
        ) / Consensus.BLOCK_INPUT_WEIGHT
    }

    selectCoins(
        utxoList: UTXOInterface[],
        amount: number,
        height: number,
        minimumConfirmations: number,
        maxOutputs: number,
        useAll: boolean,
    ) {
        // maxAvailable can not be bigger than maxOutputs
        const maxAvailable = Math.min(utxoList.length, maxOutputs);
        const eligible = utxoList.filter((utxo) => utxo.height + minimumConfirmations < height);

        // sort eligible utxo list by increasing value
        eligible.sort((a, b) => a < b ? 1 : -1);

        return maxAvailable ? {
            maxAvailable,
            utxoList: this.selectFrom(amount, eligible, useAll)
        } : {
            maxAvailable,
            utxoList: eligible.reverse().filter((_, i) => i < maxAvailable)
        }
    }

    selectFrom(
        amount: number,
        utxoList: UTXOInterface[],
        useAll: boolean
    ): UTXOInterface[] {
        // TODO: select utxo list
        console.log(amount, useAll);
        return utxoList
    }

    txFee(
        inputLen: number,
        outputLen: number,
        kernelLen: number,
        baseFee: number = DEFAULT_BASE_FEE
    ) {
        let bodyWeight = outputLen * 4 + kernelLen - inputLen;
        return Math.max(bodyWeight, 1) * baseFee;
    }

    inputsAndChange(
        slate: Slate,
        utxoList: UTXOInterface[],
        wallet: EncryptedWalletSeedInterface,
        amount: number,
        fee: number,
        changeLength: number,
        index: number
    ) {
        // calculate the total across all inputs, and how much is left
        const total = this.totalValue(utxoList);
        slate.withFee(fee);

        // if we are spending 10,000 coins to send 1,000 then our change will be 9,000
        // if the fee is 80 then the recipient will receive 1000 and our change will be
        // 8,920
        const change: number = total - amount - fee;

        // build inputs using the appropriate derived key_ids
        for (let utxo of utxoList) {
            if (utxo.isCoinbase) {
                slate.coinbaseInput(utxo);
            } else {
                slate.input(utxo);
            }
        }

        let changeAmountsDerivations = [];

        if (change === 0) {
            console.log('No change (sending exactly amount + fee), no change outputs to build');
        } else {
            console.log(`Building change outputs: total change: ${change} (${changeLength} outputs)`);

            const partChange = change / changeLength;
            const remainderChange = change % partChange;

            for (let x = 0; x < changeLength; x++) {
                // n-1 equal change_outputs and a final one accounting for any remainder
                const changeAmount = x === changeLength - 1 ? partChange + remainderChange :partChange;
                const changeKey = wallet.nextChild(index);

                changeAmountsDerivations.push({ changeAmount, changeKey });
                slate.output(changeAmount, changeKey);
            }
        }

        return changeAmountsDerivations;
    }

    totalValue(utxoList: UTXOInterface[]) {
        return utxoList.reduce((sum, { value }) => (sum + value), 0);
    }
}
