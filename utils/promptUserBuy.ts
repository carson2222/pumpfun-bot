import * as web3 from "@solana/web3.js";
import inquirer from "inquirer";
async function promptUserBuy() {
  // Load token
  let tokenAddress: web3.PublicKey;
  // If it's in the .env file load it
  if (process.env.TOKEN_ADDRESS) {
    tokenAddress = new web3.PublicKey(process.env.TOKEN_ADDRESS);
    console.log("Loaded token address from .env file:", tokenAddress);
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
    console.log("Loaded token address from user: ", tokenAddress.toString());
  }

  // Load SOL amount to pend
  let solAmount: number;
  // If it's in the .env file load it
  if (process.env.SOL_AMOUNT) {
    solAmount = +process.env.SOL_AMOUNT;
    console.log("Loaded SOL amount from .env file: ", solAmount);
  }
  // Otherwise ask the user
  else {
    //@ts-ignore
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "solAmount",
        message: "Enter SOL amount:",
      },
    ]);

    solAmount = +answer.solAmount;
    console.log("Loaded SOL amount from user: ", solAmount);
  }

  return { tokenAddress, solAmount };
}

export default promptUserBuy;
