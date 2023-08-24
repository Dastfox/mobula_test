import { GraphQLClient } from 'graphql-request';

// Subgraph endpoint (replace with the correct endpoint)
const endpoint = 'https://api.thegraph.com/subgraphs/name/somemoecoding/surgeswap-v2';

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
	token?: Token;
};

type Ticker = {
	last_price: number;
	liquidity_in_usd?: number;
	base_volume: number;
};

type Token = {
	name: string;
	tokenDayData: TokenDayData[];
};

type TokenDayData = {
	id: string;
	date: number;
	priceUSD: number;
	dailyVolumeUSD: number;
	totalLiquidityUSD: number;
};

type priceHistory = {
	timestamp: number;
	priceUSD: number;
};

type volumeHistory = {
	timestamp: number;
	volumeUSD: number;
};

type liquidityHistory = {
	timestamp: number;
	liquidityUSD: number;
};

type finalData = {
	priceHistory?: priceHistory[];
	volumeHistory?: volumeHistory[];
	liquidityHistory?: liquidityHistory[];
};

// Function to retrieve price history
async function getPriceHistory(tokenId: string, blockNumber: number): Promise<finalData> {
	var finalData: finalData = {
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
	const data: Query = await client.request(query);

	if (!data.token) {
		return finalData;
	}

	for (let i = 0; i < data.token?.tokenDayData.length; i++) {
		finalData.priceHistory?.push({
			timestamp: data.token.tokenDayData[i].date,
			priceUSD: data.token.tokenDayData[i].priceUSD,
		});
		finalData.volumeHistory?.push({
			timestamp: data.token.tokenDayData[i].date,
			volumeUSD: data.token.tokenDayData[i].dailyVolumeUSD,
		});
		finalData.liquidityHistory?.push({
			timestamp: data.token.tokenDayData[i].date,
			liquidityUSD: data.token.tokenDayData[i].totalLiquidityUSD,
		});
	}
	return finalData;
}
const exampleTokenId = '0x43C3EBaFdF32909aC60E80ee34aE46637E743d65';
const exampleTokenIdLower = exampleTokenId.toLowerCase();

async function main() {
	const priceHistory = await getPriceHistory(exampleTokenIdLower, genesisBlockNumber);
	console.log('priceHistory', priceHistory);
}

main().catch(console.error);
