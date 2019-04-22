import { WalletConfig, EncryptedWalletSeedInterface } from './types';
import { Network } from './networks';
interface WalletInterface {
    network: Network;
    walletConfig: WalletConfig | {};
    encSeed: EncryptedWalletSeedInterface;
}
export declare class Wallet implements WalletInterface {
    network: Network;
    walletConfig: WalletConfig | {};
    encSeed: EncryptedWalletSeedInterface;
    constructor(walletConfig?: WalletConfig, isTestnet?: boolean);
    init(password: string, seedLength: number | undefined, recoveryPharse: string | null): {
        encSeed: EncryptedWalletSeedInterface;
        mnemonic: string[];
    };
}
export {};
