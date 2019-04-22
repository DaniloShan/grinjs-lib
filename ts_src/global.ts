enum ChainTypes {
    Mainnet = 'mainnet',
    Floonet = 'floonet',
    UserTesting = 'usernet',
    AutomatedTesting = 'autonet'
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
