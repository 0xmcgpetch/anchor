import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";

import type { MissingDiscriminator } from "../target/types/missing_discriminator";

describe("missing-discriminator", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace
    .MissingDiscriminator as anchor.Program<MissingDiscriminator>;

  it("bypasses discriminator using unchecked deserialize", async () => {
    // Initialize a valid MyData first (so we have program accounts to compare)
    const payer = (program.provider.wallet as any).payer as anchor.web3.Keypair;

    // Create an account with the wrong discriminator bytes but same size
    const fake = anchor.web3.Keypair.generate();
    const lamports = await program.provider.connection.getMinimumBalanceForRentExemption(8 + 8);
    const createIx = anchor.web3.SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: fake.publicKey,
      lamports,
      space: 16,
      programId: program.programId,
    });
    const tx1 = new anchor.web3.Transaction().add(createIx);
    await anchor.web3.sendAndConfirmTransaction(
      program.provider.connection,
      tx1,
      [payer, fake]
    );

    // Write arbitrary (wrong) discriminator bytes via program method to avoid custom RPCs
    const wrongDisc = Array.from(Buffer.alloc(8, 0xab)) as unknown as number[];
    await program.methods
      .writeWrongDisc(wrongDisc as any)
      .accounts({ anyAccount: fake.publicKey })
      .rpc();

    // Call write_using_unchecked; should succeed even though discriminator is wrong
    const sig = await program.methods
      .readUnchecked()
      .accounts({ anyAccount: fake.publicKey })
      .rpc();
    const conf = await program.provider.connection.confirmTransaction(sig, "confirmed");
    assert.strictEqual(conf.value.err, null);
  });
});
