import { GraphQLClient } from 'graphql-request';

// Subgraph endpoint (replace with the correct endpoint)
const endpoint = 'https://api.thegraph.com/subgraphs/name/somemoecoding/surgeswap-v1-cg-bsc';

const genesisBlockNumber = 24725999;

const client = new GraphQLClient(endpoint);

const moment = require('moment');

import Web3 from 'web3';

const web3 = new Web3('https://bsc-dataseed.binance.org/'); // Replace with the appropriate RPC URL

var blockNumberVar = 0;

web3.eth.getBlockNumber().then((blockNumber) => {
	blockNumberVar = Number(blockNumber);
	console.log('blockNumber', blockNumberVar);
});

type Query = {
	ticker?: Ticker;
	tickers?: Ticker[];
};

type Ticker = {
	last_price: number;
	liquidity_in_usd?: number;
	base_volume: number;
};

async function getBlockTimestamp(blockNumber: number): Promise<number> {
	const block = await web3.eth.getBlock(blockNumber);
	return Number(block.timestamp);
}

// Function to retrieve price history
async function getPriceHistory(tokenId: string, blockNumber: number): Promise<any[]> {
	const query = `
{
  ticker(id: "${tokenId}", block: {number: ${blockNumber}}) {
    last_price
  }
}
 `;

	// Fetch data from the subgraph
	const data: Query = await client.request(query);

	// Process and return the price
	// Return as an array of arrays to match the expected return type
	return [[data.ticker?.last_price]];
}

async function getVolumeHistory(tokenId: string): Promise<any> {
	// Query current volume
	const currentQuery = `
    {
      ticker(id: "${tokenId}") {
        base_volume
      }
    }
  `;

	const currentVolumeData: Query = await client.request(currentQuery);
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

	const pastVolumeData: Query = await client.request(pastQuery);

	const pastVolume = pastVolumeData.ticker ? Number(pastVolumeData.ticker.base_volume) : 0;

	const dayVolume = currentVolume - pastVolume;
	console.log('volumes', 'currentVolumeData', currentVolumeData, 'pastVolumeData', pastVolumeData);
	console.log('dayVolume', dayVolume);

	// Calculate and return 24-hour volume
	return dayVolume;
}

// Function to retrieve liquidity history
async function getLiquidityHistory(tokenId: string): Promise<any[]> {
	const query = `
    {
      ticker(id: "${tokenId}") {
        liquidity_in_usd
      }
    }
  `;

	// Fetch data from the subgraph
	const data: any = await client.request(query);
	console.log('DATA 74', data);

	// Process and return the liquidity history
	return data.ticker.map((item: any) => [item.timestamp, item.liquidity_in_usd]);
}

const exampleTokenId = '0x43C3EBaFdF32909aC60E80ee34aE46637E743d65';

async function main() {
	const priceHistory = await getPriceHistory(exampleTokenId, genesisBlockNumber);
	const volumeHistory = await getVolumeHistory(exampleTokenId);
	const liquidityHistory = await getLiquidityHistory(exampleTokenId);

	console.log('Price History:', priceHistory);
	console.log('Volume History:', volumeHistory);
	console.log('Liquidity History:', liquidityHistory);
}

main().catch(console.error);
