import { IdInterface } from './types';

enum ChainTypes {
    Mainnet = 'Mainnet',
    Floonet = 'Floonet',
    UserTesting = 'UserTesting',
    AutomatedTesting = 'AutomatedTesting'
}

namespace ChainTypes {
    export function shortname(type: ChainTypes): string {
        switch (type) {
            case ChainTypes.Floonet: return 'floo';
            case ChainTypes.UserTesting: return 'user';
            case ChainTypes.AutomatedTesting: return 'auto';
            default: return 'main';
        }
    }

    export function Default(): string {
        return ChainTypes.Mainnet
    }
}

export { ChainTypes }

export const SECRET_KEY_SEED = 'IamVoldemort';

export enum Consensus {
    BLOCK_OUTPUT_WEIGHT = 21,
    BLOCK_KERNEL_WEIGHT = 3,
    BLOCK_INPUT_WEIGHT = 1,
    MILLI_GRIN = 1000000
}

const TESTING_MAX_BLOCK_WEIGHT = 150;
const MAX_BLOCK_WEIGHT = 40000;

export enum MaxBlockWeight {
    AutomatedTesting = TESTING_MAX_BLOCK_WEIGHT,
    UserTesting = TESTING_MAX_BLOCK_WEIGHT,
    Floonet = MAX_BLOCK_WEIGHT,
    Mainnet = MAX_BLOCK_WEIGHT
}

export const DEFAULT_BASE_FEE = Consensus.MILLI_GRIN;

export const DERIV_PREFIX = 100;

export const SEP = 58;

export function idToPath(id: Buffer): IdInterface {
    const idArr = [...id];
    const depth = idArr.splice(0, 1)[0];
    const path = [];
    while (idArr.length) {
        path.push({
            index: +idArr.splice(0, 4).join('')
        })
    }

    return {
        depth,
        path
    }
}

export function pathToId(id: IdInterface): Buffer {
    let idArr: number[] = [];
    idArr[0] = id.depth;
    id.path.map(({ index }) => (idArr = idArr.concat([0, 0, 0, index])));
    return Buffer.from(idArr)
}

export function toBuffer(income: Buffer | [] | string) {
    return Buffer.isBuffer(income) ? income
           :
           Array.isArray(income) ? Buffer.from(income) : Buffer.from(income, 'hex');
}
