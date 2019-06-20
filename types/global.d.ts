/// <reference types="node" />
import { IdInterface } from './types';
declare enum ChainTypes {
    Mainnet = "Mainnet",
    Floonet = "Floonet",
    UserTesting = "UserTesting",
    AutomatedTesting = "AutomatedTesting"
}
declare namespace ChainTypes {
    function shortname(type: ChainTypes): string;
    function Default(): string;
}
export { ChainTypes };
export declare const SECRET_KEY_SEED = "IamVoldemort";
export declare enum Consensus {
    BLOCK_OUTPUT_WEIGHT = 21,
    BLOCK_KERNEL_WEIGHT = 3,
    BLOCK_INPUT_WEIGHT = 1,
    MILLI_GRIN = 1000000
}
export declare enum MaxBlockWeight {
    AutomatedTesting,
    UserTesting,
    Floonet,
    Mainnet
}
export declare const DEFAULT_BASE_FEE = Consensus.MILLI_GRIN;
export declare const DERIV_PREFIX = 100;
export declare const SEP = 58;
export declare function idToPath(id: Buffer): IdInterface;
export declare function pathToId(id: IdInterface): Buffer;
export declare function toBuffer(income: Buffer | [] | string): Buffer;
