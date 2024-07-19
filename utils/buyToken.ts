import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import getBondingCurvePDA from "./getBondingCurvePDA";
import tokenDataFromBondingCurveTokenAccBuffer from "./tokenDataFromBondingCurveTokenAccBuffer";
import getBuyPrice from "./getBuyPrice";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { PumpFun } from "../pump-fun";
import IDL from "../pump-fun.json";
async function buyToken(
  mint: web3.PublicKey,
  connection: web3.Connection,
  keypair: web3.Keypair,
  solAmount: number,
  slippage: number
) {
  // Load Pumpfun provider
  const provider = new AnchorProvider(connection, new Wallet(keypair), {
    commitment: "finalized",
  });
  const program = new Program<PumpFun>(IDL as PumpFun, provider);

  // Get/Create token account
  const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey);
  if (!tokenAccount) {
    throw new Error("Failed to get/create token account");
  }

  // Buy token on Pump.fun

  const PUMPFUN_PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
  const pumpfunPunKey = new web3.PublicKey(PUMPFUN_PROGRAM_ID);

  const bondingCurve = getBondingCurvePDA(mint, pumpfunPunKey);
  const associatedBondingCurve = await getAssociatedTokenAddress(mint, bondingCurve, true);
  const BondingCurveTokenAccount = await connection.getAccountInfo(bondingCurve);

  const tokenData = tokenDataFromBondingCurveTokenAccBuffer(BondingCurveTokenAccount!.data);
  if (tokenData.complete) {
    throw new Error("Bonding curve already completed");
  }
  const SLIPAGE_POINTS = BigInt(slippage * 100);
  const solAmountLamp = BigInt(solAmount * web3.LAMPORTS_PER_SOL);
  const buyAmountToken = getBuyPrice(solAmountLamp, tokenData);
  const buyAmountSolWithSlippage = solAmountLamp + (solAmountLamp * SLIPAGE_POINTS) / 10000n;

  const FEE_RECEIPT = new web3.PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM");
  const transaction = new web3.Transaction();

  // request a specific compute unit budget
  const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });

  // set the desired priority fee
  const addPriorityFee = web3.ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 0.00001 * 1000000000,
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
          associatedUser: tokenAccount.address,
          user: keypair.publicKey,
        })
        .transaction()
    );

  //#1
  console.log(new Date().toISOString());
  const sig = await web3.sendAndConfirmTransaction(connection, transaction, [keypair]);
  //#2
  console.log(new Date().toISOString());
  return sig;
}
export default buyToken;
