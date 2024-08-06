import * as token from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import getBondingCurvePDA from "./getBondingCurvePDA";
import tokenDataFromBondingCurveTokenAccBuffer from "./tokenDataFromBondingCurveTokenAccBuffer";
import getBuyPrice from "./getBuyPrice";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { PumpFun } from "../idl/pump-fun";
import IDL from "../idl/pump-fun.json";
import wait from "./wait";
import getBondingCurveTokenAccountWithRetry from "./getBondingCurveTokenAccountWithRetry";

const BOANDING_CURVE_ACC_RETRY_AMOUNT = 5;
const BOANDING_CURVE_ACC_RETRY_DELAY = 50;
async function buyToken(
  mint: web3.PublicKey,
  connection: web3.Connection,
  keypair: web3.Keypair,
  solAmount: number,
  slippage: number,
  priorityFee?: number
) {
  try {
    // Load Pumpfun provider
    const provider = new AnchorProvider(connection, new Wallet(keypair), {
      commitment: "finalized",
    });
    const program = new Program<PumpFun>(IDL as PumpFun, provider);

    // Create transaction
    const transaction = new web3.Transaction();

    // Get/Create token account
    const associatedUser = await token.getAssociatedTokenAddress(mint, keypair.publicKey, false);

    try {
      await token.getAccount(connection, associatedUser, "finalized");
    } catch (e) {
      transaction.add(
        token.createAssociatedTokenAccountInstruction(keypair.publicKey, associatedUser, keypair.publicKey, mint)
      );
    }
    console.log("Account created/loaded");

    // Buy token on Pump.fun
    console.log("Buying");
    const programId = new web3.PublicKey(process.env.PUMPFUN_PROGRAM_ID!);

    const bondingCurve = getBondingCurvePDA(mint, programId);
    const associatedBondingCurve = await token.getAssociatedTokenAddress(mint, bondingCurve, true);
    // let BondingCurveTokenAccount: web3.AccountInfo<Buffer> | null = null;

    const bondingCurveTokenAccount = await getBondingCurveTokenAccountWithRetry(
      connection,
      bondingCurve,
      BOANDING_CURVE_ACC_RETRY_AMOUNT,
      BOANDING_CURVE_ACC_RETRY_DELAY
    );

    if (bondingCurveTokenAccount === null) {
      throw new Error("Bonding curve account not found");
    }
    const tokenData = tokenDataFromBondingCurveTokenAccBuffer(bondingCurveTokenAccount!.data);
    if (tokenData.complete) {
      throw new Error("Bonding curve already completed");
    }
    const SLIPAGE_POINTS = BigInt(slippage * 100);
    const solAmountLamp = BigInt(solAmount * web3.LAMPORTS_PER_SOL);
    const buyAmountToken = getBuyPrice(solAmountLamp, tokenData);
    const buyAmountSolWithSlippage = solAmountLamp + (solAmountLamp * SLIPAGE_POINTS) / 10000n;

    const FEE_RECEIPT = new web3.PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM");

    // request a specific compute unit budget
    const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    // set the desired priority fee
    const addPriorityFee = web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: typeof priorityFee === "number" ? priorityFee * 1000000000 : 0.00001 * 1000000000,
      // microLamports: 0.005 * 1000000000,
    });

    transaction
      .add(modifyComputeUnits)
      .add(addPriorityFee)
      .add(
        await program.methods
          .buy(new BN(buyAmountToken.toString()), new BN(buyAmountSolWithSlippage.toString()))
          .accounts({
            feeRecipient: FEE_RECEIPT,
            mint: mint,
            associatedBondingCurve: associatedBondingCurve,
            associatedUser: associatedUser,
            user: keypair.publicKey,
          })
          .transaction()
      );

    console.log(`Sending transaction for buying ${mint.toString()}, ${new Date().toISOString()}`);
    const sig = await web3.sendAndConfirmTransaction(connection, transaction, [keypair]);
    console.log(`Successfully bought ${mint.toString()}, ${new Date().toISOString()}`);
    return sig;
  } catch (error) {
    console.error(error);
  }
}
export default buyToken;
