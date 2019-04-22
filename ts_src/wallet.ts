import { WalletConfig, WalletSeed, EncryptedWalletSeed, EncryptedWalletSeedInterface, defaultConfig } from './types';
import { Network, floonet, mainnet } from './networks';

interface WalletInterface {
    network: Network,
    walletConfig: WalletConfig | {},
    encSeed: EncryptedWalletSeedInterface
}

export class Wallet implements WalletInterface {
    network: Network;
    walletConfig: WalletConfig | {};
    encSeed: EncryptedWalletSeedInterface = new EncryptedWalletSeed('', '', '');

    constructor(walletConfig: WalletConfig = defaultConfig, isTestnet = false) {
        this.network = isTestnet ? floonet : mainnet;
        this.walletConfig = walletConfig;
    }

    init(password: string, recoveryPharse: string[] | null, seedLength: number = 32)
        : {
        encSeed: EncryptedWalletSeedInterface,
        mnemonic: string[]
    } {
        const newWallet = new WalletSeed(seedLength);
        this.encSeed = newWallet.init(password, recoveryPharse);

        return { encSeed: this.encSeed, mnemonic: newWallet.toMnemonic() };
    }
}
