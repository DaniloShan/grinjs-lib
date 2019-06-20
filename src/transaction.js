"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slate_1 = require("./slate");
const global_1 = require("./global");
class Transaction {
    // TODO: tx index
    init(amount, height, utxoList, wallet, index, changeLength = 1, minimumConfirmations = 10, useAll = true) {
        const slate = new slate_1.Slate(amount, height, wallet);
        this.addInputsToSlate(utxoList.map(utxo => (Object.assign(utxo, {
            keyId: global_1.toBuffer(utxo.keyId),
            commit: global_1.toBuffer(utxo.commit)
        }))), wallet, slate, changeLength, minimumConfirmations, useAll, index
        // 0,
        // message
        );
        return slate.build;
    }
    addInputsToSlate(utxoList, wallet, slate, changeLength, minimumConfirmations, useAll, index
    // participantId: number,
    // message: string
    ) {
        this.buildSendTx(utxoList, wallet, slate, changeLength, minimumConfirmations, useAll, index);
    }
    buildSendTx(utxoListFromArgs, wallet, slate, changeLength, minimumConfirmations, useAll, index) {
        const { utxoList, changeAmountsDerivations, fee } = this.selectSendTx(utxoListFromArgs, wallet, slate, minimumConfirmations, changeLength, useAll, index);
        const blinding = slate.addTransactionElements(utxoList, fee);
        console.log(blinding);
        console.log(changeAmountsDerivations);
        console.log('tx: ', JSON.stringify(slate.build));
    }
    selectSendTx(utxoListFromArgs, wallet, slate, minimumConfirmations, changeLength, useAll, index) {
        const { utxoList, fee, amount } = this.selectCoinsAndFee(utxoListFromArgs, wallet, slate.build.amount, slate.build.height, minimumConfirmations, changeLength, useAll);
        // build transaction skeleton with inputs and change
        const changeAmountsDerivations = this.inputsAndChange(slate, utxoList, wallet, amount, fee, changeLength, index);
        slate.withLockHeight(slate.build.lockHeight);
        return {
            utxoList,
            changeAmountsDerivations,
            fee
        };
    }
    selectCoinsAndFee(utxoListFromArgs, wallet, amount, currentHeight, minimumConfirmations, changeLength, useAll) {
        let { maxAvailable, utxoList } = this.selectCoins(utxoListFromArgs, amount, currentHeight, minimumConfirmations, this.calculateMaxInputsInBlock(changeLength, wallet.config.chainType), useAll);
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
                const coins = this.selectCoins(utxoList, amountWithFee, currentHeight, minimumConfirmations, this.calculateMaxInputsInBlock(numOutputs, wallet.config.chainType), useAll);
                utxoList = coins.utxoList;
                fee = this.txFee(utxoList.length, numOutputs, 1);
                total = this.totalValue(utxoList);
                amountWithFee = amount + fee;
            }
        }
        return { utxoList, total, amount, fee };
    }
    calculateMaxInputsInBlock(numOutputs, chainType) {
        const coinbaseWeight = global_1.Consensus.BLOCK_OUTPUT_WEIGHT + global_1.Consensus.BLOCK_KERNEL_WEIGHT;
        return (global_1.MaxBlockWeight[chainType] - (coinbaseWeight +
            global_1.Consensus.BLOCK_OUTPUT_WEIGHT * numOutputs +
            global_1.Consensus.BLOCK_KERNEL_WEIGHT)) / global_1.Consensus.BLOCK_INPUT_WEIGHT;
    }
    selectCoins(utxoList, amount, height, minimumConfirmations, maxOutputs, useAll) {
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
        };
    }
    selectFrom(amount, utxoList, useAll) {
        // TODO: select utxo list
        console.log(amount, useAll);
        return utxoList;
    }
    txFee(inputLen, outputLen, kernelLen, baseFee = global_1.DEFAULT_BASE_FEE) {
        let bodyWeight = outputLen * 4 + kernelLen - inputLen;
        return Math.max(bodyWeight, 1) * baseFee;
    }
    inputsAndChange(slate, utxoList, wallet, amount, fee, changeLength, index) {
        // calculate the total across all inputs, and how much is left
        const total = this.totalValue(utxoList);
        slate.withFee(fee);
        // if we are spending 10,000 coins to send 1,000 then our change will be 9,000
        // if the fee is 80 then the recipient will receive 1000 and our change will be
        // 8,920
        const change = total - amount - fee;
        // build inputs using the appropriate derived key_ids
        for (let utxo of utxoList) {
            if (utxo.isCoinbase) {
                slate.coinbaseInput(utxo);
            }
            else {
                slate.input(utxo);
            }
        }
        let changeAmountsDerivations = [];
        if (change === 0) {
            console.log('No change (sending exactly amount + fee), no change outputs to build');
        }
        else {
            console.log(`Building change outputs: total change: ${change} (${changeLength} outputs)`);
            const partChange = change / changeLength;
            const remainderChange = change % partChange;
            for (let x = 0; x < changeLength; x++) {
                // n-1 equal change_outputs and a final one accounting for any remainder
                const changeAmount = x === changeLength - 1 ? partChange + remainderChange : partChange;
                const changeKey = wallet.nextChild(index);
                changeAmountsDerivations.push({ changeAmount, changeKey });
                slate.output(changeAmount, changeKey);
            }
        }
        return changeAmountsDerivations;
    }
    totalValue(utxoList) {
        return utxoList.reduce((sum, { value }) => (sum + value), 0);
    }
}
exports.Transaction = Transaction;
