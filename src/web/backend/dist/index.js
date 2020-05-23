"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var redis_1 = __importDefault(require("redis"));
var util_1 = require("util");
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var redisClient = redis_1.default.createClient();
var redisGetAsync = util_1.promisify(redisClient.get).bind(redisClient);
var redisKeysAsync = util_1.promisify(redisClient.keys).bind(redisClient);
var PORT = process.env.APP_HTTP_PORT || 9000;
var PORT_DAPR = process.env.DAPR_HTTP_PORT || 9500;
var app = express();
app.use(body_parser_1.default.json());
app.use(cors_1.default());
app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.send("Hello World");
        return [2 /*return*/];
    });
}); });
app.get('/actors', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var actors, actorType, arr, _i, actors_1, actor, actorKeys;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, redisKeysAsync("*")];
            case 1:
                actors = _a.sent();
                actorType = "RoadworkTwinActor";
                arr = [];
                for (_i = 0, actors_1 = actors; _i < actors_1.length; _i++) {
                    actor = actors_1[_i];
                    actorKeys = actor.split('||');
                    // Skip if it's not our actor type
                    if (actorKeys[1] != actorType) {
                        continue;
                    }
                    arr.push({
                        meta: {
                            stateKey: actor
                        },
                        name: actorKeys[2]
                    });
                }
                return [2 /*return*/, res.send(arr)];
        }
    });
}); });
app.listen(PORT, function () { return console.log("Server started at 0.0.0.0:" + PORT + ", Dapr at " + PORT_DAPR); });
