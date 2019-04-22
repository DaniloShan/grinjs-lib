declare enum ChainTypes {
    Mainnet = "mainnet",
    Floonet = "floonet",
    UserTesting = "usernet",
    AutomatedTesting = "autonet"
}
declare namespace ChainTypes {
    function shortname(type: ChainTypes): string;
    function Default(): string;
}
export { ChainTypes };
