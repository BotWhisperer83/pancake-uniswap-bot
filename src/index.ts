import * as dotenv from "dotenv";
dotenv.config();
import axios from "axios";

import { Config } from "../src/config/config";
import { PANCAKESWAP_ABI } from "../src/constants/pancakeswap";
import { HelpersWrapper } from "../src/helpers/helpers";
import { SwapsWrapper } from "../src/swapps/swaps";

const wallet = {
  ADDRESS: String(process.env.WALLET_ADDRESS),
  PRIVATE_KEY: String(process.env.WALLET_PRIVATE_KEY),
};

const cmcTokenURL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`;
const coinmarketcap_key = "9cbf9ad9-2302-46c5-92eb-16d8a4373ca1";

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 0.001)) + min;
};

const sleep = (ms: number | undefined) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const fetchTokenPrice = async (symbol: String) => {
  try {
    // const res = await axios.get(cmcTokenURL, {
    //   headers: {
    //     "X-CMC_PRO_API_KEY": coinmarketcap_key,
    //   },
    //   params: {
    //     symbol: symbol,
    //   },
    // });
    // return res.data.data[String(symbol)].quote.USD.price;
    return 1.1;
  } catch (error) {
    console.log(error);
  }
};

const executeBuyOrder = async (quantity: number): Promise<void> => {
  console.log("buy quantity: ", quantity);
  const buyPath = [Config.WBASE, String(process.env.TOKEN_ADDRESS)];
  let buyTx: any =
    await SwapsWrapper.swapExactETHForTokensSupportingFeeOnTransferTokens(
      wallet,
      0,
      quantity, //fixes  scientific notation issue i.e 1e-7 which resp 0.0000001
      buyPath
    );
  console.log(`waiting ${2} seconds...`);
  await sleep(2 * 1000);
};

const buy = async () => {
  try {
    const tokenPrice = await fetchTokenPrice(String(process.env.TOKEN_SYMBOL));
    if (Number(tokenPrice) >= Number(process.env.STOP_PRICE)) {
      console.log(
        `Stop price reached. Current price: ${tokenPrice}. Stopprice: ${Number(
          process.env.STOP_PRICE
        )}`
      );
      process.exit();
    }

    const quantity = getRandomNumber(
      Number(process.env.MIN_BUY_QUANTITY),
      Number(process.env.MAX_BUY_QUANTITY)
    );
    await executeBuyOrder(quantity);
  } catch (error) {}
};

const executeSellOrder = async (quantity: number): Promise<void> => {
  console.log("sell quantity: ", quantity);
  const sellPath = [Config.SUPPORTED_TOKEN, Config.WBNB];
  await SwapsWrapper.swapExactTokensForETHSupportingFeeOnTransferTokens(
    wallet,
    quantity,
    0,
    sellPath
  );
  console.log(`waiting ${2} seconds...`);
  await sleep(2 * 1000);
};

const sell = async () => {
  try {
    const tokenPrice = await fetchTokenPrice(String(process.env.TOKEN_SYMBOL));
    if (Number(tokenPrice) >= Number(process.env.STOP_PRICE)) {
      console.log(
        `Stop price reached. Current price: ${tokenPrice}. Stopprice: ${Number(
          process.env.STOP_PRICE
        )}`
      );
      process.exit();
    }

    const quantity = getRandomNumber(
      Number(process.env.MIN_SELL_QUANTITY),
      Number(process.env.MAX_SELL_QUANTITY)
    );
    await executeSellOrder(quantity);
  } catch (error) {}
};

const main = async () => {
  while (true) {
    try {
      const rnt = getRandomNumber(1, 2);
      if (rnt == 1) {
        await buy();
      } else {
        await sell();
      }
    } catch (error) {}
  }
};

main();
