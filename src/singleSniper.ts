import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import * as web3 from "@solana/web3.js";
import dotenv from "dotenv";
import buyToken from "../utils/buyToken";
import promptUserBuy from "../utils/promptUserBuy";
dotenv.config();

async function main() {
  try {
    console.log("Starting the program");

    //Load keypair
    const keypair = getKeypairFromEnvironment("SECRET_KEY");
    if (!keypair) {
      throw new Error("Missing secret key. Fill it in .env file");
    }

    // Load RPC
    const rpc = process.env.HTTPS_ENDPOINT;
    if (!rpc) {
      throw new Error("Missing RPC. Fill it in .env file");
    }

    // Connect to network
    const connection = new web3.Connection(rpc!, "confirmed");
    if (!connection) {
      throw new Error("Failed to connect to network");
    }
    console.log("Connected to the network");

    const { tokenAddress, solAmount, slippage, priorityFee } = await promptUserBuy();
    const sig = await buyToken(tokenAddress, connection, keypair, solAmount, slippage, priorityFee);
    console.log("Signature:", sig);
  } catch (error) {
    console.error(error.message);
    console.error(error);
  }
  console.log("Program finished");
}

main();
