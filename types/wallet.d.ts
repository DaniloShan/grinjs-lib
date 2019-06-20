import { WalletConfig, WalletInterface, EncryptedWalletSeedInterface } from './types';
import { Network } from './networks';
export declare class Wallet implements WalletInterface {
    network: Network;
    walletConfig: WalletConfig | {};
    constructor(walletConfig?: WalletConfig, isTestnet?: boolean);
    init(password: string, recoveryPharse: string[] | null, seedLength?: number): {
        wallet: EncryptedWalletSeedInterface;
        mnemonic: string[];
    };
}
