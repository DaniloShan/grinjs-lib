const { Wallet, Transaction } = require('../src/index');

const words = 'language network just rib trade strategy sting leopard reunion boy west music gown rude shallow prepare doll eye toss rude trip young remain skill'.split(' ');

const newWallet = new Wallet();
const { wallet } = newWallet.init('123456', words);
const tx = new Transaction();
const utxoList = [{
    keyId: '0300000000000000000000000400000000',
    height: 127700,
    value: 1000000000000,
    isCoinbase: false,
    commit: '09934cde01afc6a27e84217c33b3c4ea6c1a93527d55ca2bb4e77c6fcf6576ca29'
}];

tx.init(
    1000000000,
    133494,
    utxoList,
    wallet,
    52
)
