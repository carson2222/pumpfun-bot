import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import dotenv from "dotenv";
import inquirer from "inquirer";
import getBondingCurvePDA from "./utils/getBondingCurvePDA";
import { BN } from "bn.js";
import { bool, struct, u64 } from "@coral-xyz/borsh";
import tokenDataFromBondingCurveTokenAccBuffer from "./utils/tokenDataFromBondingCurveTokenAccBuffer";
import getBuyPrice from "./utils/getBuyPrice";
import * as borsh from "borsh";
import { AnchorProvider, Program, Provider, Wallet } from "@coral-xyz/anchor";
import IDL from "./pump-fun.json";
import { PumpFun } from "./pump-fun";
import buyToken from "./utils/buyToken";
dotenv.config();

async function main() {
  try {
    // // Load keypair
    const keypair = getKeypairFromEnvironment("SECRET_KEY");
    if (!keypair) {
      throw new Error("Missing secret key. Fill it in .env file");
    }

    console.log("Loaded keypair from .env file:" + keypair.publicKey.toString());

    // // Load RPC
    const rpc = process.env.RPC;
    if (!rpc) {
      throw new Error("Missing RPC. Fill it in .env file");
    }

    console.log("Loaded RPC from .env file:" + rpc);

    // // Connect to network
    const connection = new web3.Connection(rpc!, "confirmed");
    if (!connection) {
      throw new Error("Failed to connect to network");
    }

    // Load token
    let tokenAddress: web3.PublicKey;
    // If it's in the .env file load it
    if (process.env.TOKEN_ADDRESS) {
      tokenAddress = new web3.PublicKey(process.env.TOKEN_ADDRESS);
      console.log("Loaded token address from .env file:" + tokenAddress);
    }
    // Otherwise ask the user
    else {
      //@ts-ignore
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: "tokenAddress",
          message: "Enter token address:",
        },
      ]);

      tokenAddress = new web3.PublicKey(answer.tokenAddress);
      console.log("Loaded token address from user:" + tokenAddress);
    }

    // Load Pumpfun provider
    const provider = new AnchorProvider(connection, new Wallet(keypair), {
      commitment: "finalized",
    });
    const program = new Program<PumpFun>(IDL as PumpFun, provider);

    // Load SOL amount to pend
    let solAmount: number;
    if (process.env.SOL_AMOUNT) {
      solAmount = +process.env.SOL_AMOUNT;
      console.log("Loaded SOL amount from .env file:" + solAmount);
    } else {
      //@ts-ignore
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: "solAmount",
          message: "Enter SOL amount:",
        },
      ]);

      solAmount = +answer.solAmount;
      console.log("Loaded SOL amount from user:" + solAmount);
    }

    buyToken(tokenAddress, connection, keypair, solAmount, 5, program);
  } catch (error) {
    console.error(error.message);
    console.error(error);
  }
}
main();
