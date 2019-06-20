const uuid = require('uuid/v4');
const Secp = require('secp256k1-zkp');
const secp = new Secp();
import {
    SlateInterface,
    EncryptedWalletSeedInterface,
    UTXOInterface,
    IdInterface
} from './types';
import { idToPath, pathToId } from './global';

export class Slate {
    // TODO: import bigInt
    build: SlateInterface;
    wallet: EncryptedWalletSeedInterface;
    constructor(amount: number, height: number, wallet: EncryptedWalletSeedInterface) {
        this.wallet = wallet;
        this.build =  {
            numParticipants: 2,
            id: uuid(),
            tx: {
                offset: '0000000000000000000000000000000000000000000000000000000000000000',
                body: {
                    inputs: [],
                    outputs: [],
                    kernels: []
                }
            },
            amount,
            fee: 0,
            height,
            lockHeight: height,
            participantData: [],
            version: 1
        }
    }

    withFee(fee: number): Slate {
        this.build.tx.body.kernels.push({
            features: 'HeightLocked',
            fee: fee,
            lockHeight: this.build.height + 2,
            excess: '000000000000000000000000000000000000000000000000000000000000000000',
            excessSig: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        });
        return this;
    }

    withLockHeight(lockHeight: number): Slate {
        this.build.lockHeight = lockHeight;
        this.build.tx.body.kernels.map(kernel => kernel.lockHeight = lockHeight);
        return this;
    }

    coinbaseInput(utxo: UTXOInterface): Slate {
        this.build.tx.body.inputs.push({
            features: "Coinbase",
            commit: utxo.commit.toString('hex')
        });
        return this;
    }

    input(utxo: UTXOInterface): Slate {
        this.build.tx.body.inputs.push({
            features: "Plain",
            commit: utxo.commit.toString('hex')
        });
        return this;
    }

    output(amount: number, index: IdInterface) {
        const sKey = this.wallet.deriveKey(amount, index);
        console.log('amount: ', amount);
        console.log('index: ', pathToId(index));
        console.log('output skey: ', sKey);
        const commit = secp.commit(amount, sKey).slice(0, 33);
        console.log('output commit: ', commit);
        const nonce = this.wallet.createNonce(commit);
        console.log('bulletProofCreate: ', amount, sKey, nonce, pathToId(index).slice(1));
        const proof = secp.bulletProofCreate(amount, sKey, nonce, null, pathToId(index).slice(1));
        this.build.tx.body.outputs.push({
            features: "Plain",
            commit: commit.toString('hex'),
            proof: proof.toString('hex')
        });
    }

    addTransactionElements(utxoList: UTXOInterface[], fee: number) {
        return {
            positiveKeyIds:  [
                {
                    value: this.build.amount - fee,
                    extKeychainPath: {
                        depth: 3, path: [{ index: 0 }, { index: 0 }, { index: 1 },{ index: 0 }] }
                }
            ],
            negativeKeyIds: [
                utxoList.map(({ value, keyId}) => ({
                    value,
                    extKeychainPath: idToPath(keyId)
                }))
            ],
            positiveBlindingFactors: [],
            negativeBlindingFactors: []
        };
    }
}
