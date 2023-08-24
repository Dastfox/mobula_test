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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_request_1 = require("graphql-request");
// Subgraph endpoint (replace with the correct endpoint)
const endpoint = 'https://api.thegraph.com/subgraphs/name/somemoecoding/surgeswap-v2';
const genesisBlockNumber = 24725999;
const client = new graphql_request_1.GraphQLClient(endpoint);
const moment = require('moment');
const web3_1 = __importDefault(require("web3"));
const web3 = new web3_1.default('https://bsc-dataseed.binance.org/'); // Replace with the appropriate RPC URL
var blockNumberVar = 0;
web3.eth.getBlockNumber().then((blockNumber) => {
    blockNumberVar = Number(blockNumber);
    console.log('blockNumber', blockNumberVar);
});
function getBlockTimestamp(blockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const block = yield web3.eth.getBlock(blockNumber);
        return Number(block.timestamp);
    });
}
// Function to retrieve price history
function getPriceHistory(tokenId, blockNumber) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        var finalData = {
            priceHistory: [],
            volumeHistory: [],
            liquidityHistory: [],
        };
        const query = `{
  token(id: "${tokenId}") {
    name
    tokenDayData {
      id
      date
      priceUSD
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
}
 `;
        // Fetch data from the subgraph
        const data = yield client.request(query);
        if (!data.token) {
            return finalData;
        }
        for (let i = 0; i < ((_a = data.token) === null || _a === void 0 ? void 0 : _a.tokenDayData.length); i++) {
            (_b = finalData.priceHistory) === null || _b === void 0 ? void 0 : _b.push({
                timestamp: data.token.tokenDayData[i].date,
                priceUSD: data.token.tokenDayData[i].priceUSD,
            });
            (_c = finalData.volumeHistory) === null || _c === void 0 ? void 0 : _c.push({
                timestamp: data.token.tokenDayData[i].date,
                volumeUSD: data.token.tokenDayData[i].dailyVolumeUSD,
            });
            (_d = finalData.liquidityHistory) === null || _d === void 0 ? void 0 : _d.push({
                timestamp: data.token.tokenDayData[i].date,
                liquidityUSD: data.token.tokenDayData[i].totalLiquidityUSD,
            });
        }
        // Process and return the price
        // Return as an array of arrays to match the expected return type
        return finalData;
    });
}
function getDateFromTimestamp(timestamp) {
    return moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
}
function getVolumeHistory(tokenId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Query current volume
        const currentQuery = `
    {
      ticker(id: "${tokenId}") {
        base_volume
      }
    }
  `;
        const currentVolumeData = yield client.request(currentQuery);
        const currentVolume = currentVolumeData.ticker ? Number(currentVolumeData.ticker.base_volume) : 0;
        // Calculate the block number 24 hours ago
        const blockNumber24HoursAgo = blockNumberVar - 24 * 60 * 60;
        console.log('blockNumber24HoursAgo', blockNumber24HoursAgo);
        // Query volume 24 hours ago
        const pastQuery = `
    {
      ticker(id: "${tokenId}", block: {number: ${blockNumber24HoursAgo}}) {
        base_volume
      }
    }
  `;
        const pastVolumeData = yield client.request(pastQuery);
        const pastVolume = pastVolumeData.ticker ? Number(pastVolumeData.ticker.base_volume) : 0;
        const dayVolume = currentVolume - pastVolume;
        console.log('volumes', 'currentVolumeData', currentVolumeData, 'pastVolumeData', pastVolumeData);
        console.log('dayVolume', dayVolume);
        // Calculate and return 24-hour volume
        return dayVolume;
    });
}
// Function to retrieve liquidity history
function getLiquidityHistory(tokenId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `
    {
      ticker(id: "${tokenId}") {
        liquidity_in_usd
      }
    }
  `;
        // Fetch data from the subgraph
        const data = yield client.request(query);
        console.log('DATA 74', data);
        // Process and return the liquidity history
        return data.ticker.map((item) => [item.timestamp, item.liquidity_in_usd]);
    });
}
const exampleTokenId = '0x43C3EBaFdF32909aC60E80ee34aE46637E743d65';
const exampleTokenIdLower = exampleTokenId.toLowerCase();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const priceHistory = yield getPriceHistory(exampleTokenIdLower, genesisBlockNumber);
        console.log('priceHistory', priceHistory);
        // const volumeHistory = await getVolumeHistory(exampleTokenId);
        // const liquidityHistory = await getLiquidityHistory(exampleTokenId);
        // console.log('Price History:', priceHistory);
        // console.log('Volume History:', volumeHistory);
        // console.log('Liquidity History:', liquidityHistory);
    });
}
main().catch(console.error);
