"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChainTypes;
(function (ChainTypes) {
    ChainTypes["Mainnet"] = "mainnet";
    ChainTypes["Floonet"] = "floonet";
    ChainTypes["UserTesting"] = "usernet";
    ChainTypes["AutomatedTesting"] = "autonet";
})(ChainTypes || (ChainTypes = {}));
exports.ChainTypes = ChainTypes;
(function (ChainTypes) {
    function shortname(type) {
        switch (type) {
            case ChainTypes.Floonet: return 'floo';
            case ChainTypes.UserTesting: return 'user';
            case ChainTypes.AutomatedTesting: return 'auto';
            default: return 'main';
        }
    }
    ChainTypes.shortname = shortname;
    function Default() {
        return ChainTypes.Mainnet;
    }
    ChainTypes.Default = Default;
})(ChainTypes || (ChainTypes = {}));
exports.ChainTypes = ChainTypes;
