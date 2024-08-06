import { Connection, GetVersionedTransactionConfig, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
import buyToken from "../utils/buyToken";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
dotenv.config();

const CREATE_LOG_STR = "Program log: Instruction: Create";
const COMMITMENT = "confirmed";
async function main() {
  const PROGRAM_ID = new PublicKey(process.env.PUMPFUN_PROGRAM_ID!);
  const connection = new Connection(process.env.HTTPS_ENDPOINT!, { wsEndpoint: process.env.WSS_ENDPOINT! });
  const keypair = getKeypairFromEnvironment("SECRET_KEY");
  if (!keypair) {
    throw new Error("Missing secret key. Fill it in .env file");
  }

  const SLIPPAGE = process.env.SLIPPAGE || 10;
  const BUY_AMOUNT = process.env.BUY_AMOUNT || 0.1;
  const PRIORITY_FEE = process.env.PRIORITY_FEE || 0.003;

  const subId = await connection.onLogs(
    PROGRAM_ID,
    async (transaction) => {
      if (transaction.err) return;
      if (transaction.logs.some((log) => log === CREATE_LOG_STR)) {
        try {
          const config: GetVersionedTransactionConfig = {
            commitment: COMMITMENT,
            maxSupportedTransactionVersion: 0,
          };
          const tx = await connection.getTransaction(transaction.signature, config);
          const token = new PublicKey(tx?.transaction.message.staticAccountKeys[1].toBase58()!);
          console.log("Found token:", token.toString(), new Date().toISOString());

          // Buy token
          const sig = await buyToken(token, connection, keypair, +BUY_AMOUNT, +SLIPPAGE, +PRIORITY_FEE);
          console.log("Signature:", sig);
        } catch (error) {
          console.log(error);
          throw new Error("stopped right there");
        }
      }
    },
    "confirmed"
  );
}
main();
