"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChainTypes;
(function (ChainTypes) {
    ChainTypes["Mainnet"] = "Mainnet";
    ChainTypes["Floonet"] = "Floonet";
    ChainTypes["UserTesting"] = "UserTesting";
    ChainTypes["AutomatedTesting"] = "AutomatedTesting";
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
exports.SECRET_KEY_SEED = 'IamVoldemort';
var Consensus;
(function (Consensus) {
    Consensus[Consensus["BLOCK_OUTPUT_WEIGHT"] = 21] = "BLOCK_OUTPUT_WEIGHT";
    Consensus[Consensus["BLOCK_KERNEL_WEIGHT"] = 3] = "BLOCK_KERNEL_WEIGHT";
    Consensus[Consensus["BLOCK_INPUT_WEIGHT"] = 1] = "BLOCK_INPUT_WEIGHT";
    Consensus[Consensus["MILLI_GRIN"] = 1000000] = "MILLI_GRIN";
})(Consensus = exports.Consensus || (exports.Consensus = {}));
const TESTING_MAX_BLOCK_WEIGHT = 150;
const MAX_BLOCK_WEIGHT = 40000;
var MaxBlockWeight;
(function (MaxBlockWeight) {
    MaxBlockWeight[MaxBlockWeight["AutomatedTesting"] = TESTING_MAX_BLOCK_WEIGHT] = "AutomatedTesting";
    MaxBlockWeight[MaxBlockWeight["UserTesting"] = TESTING_MAX_BLOCK_WEIGHT] = "UserTesting";
    MaxBlockWeight[MaxBlockWeight["Floonet"] = MAX_BLOCK_WEIGHT] = "Floonet";
    MaxBlockWeight[MaxBlockWeight["Mainnet"] = MAX_BLOCK_WEIGHT] = "Mainnet";
})(MaxBlockWeight = exports.MaxBlockWeight || (exports.MaxBlockWeight = {}));
exports.DEFAULT_BASE_FEE = Consensus.MILLI_GRIN;
exports.DERIV_PREFIX = 100;
exports.SEP = 58;
function idToPath(id) {
    const idArr = [...id];
    const depth = idArr.splice(0, 1)[0];
    const path = [];
    while (idArr.length) {
        path.push({
            index: +idArr.splice(0, 4).join('')
        });
    }
    return {
        depth,
        path
    };
}
exports.idToPath = idToPath;
function pathToId(id) {
    let idArr = [];
    idArr[0] = id.depth;
    id.path.map(({ index }) => (idArr = idArr.concat([0, 0, 0, index])));
    return Buffer.from(idArr);
}
exports.pathToId = pathToId;
function toBuffer(income) {
    return Buffer.isBuffer(income) ? income
        :
            Array.isArray(income) ? Buffer.from(income) : Buffer.from(income, 'hex');
}
exports.toBuffer = toBuffer;
