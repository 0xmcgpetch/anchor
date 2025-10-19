import * as anchor from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { assert } from "chai";

import type { UnvalidatedRemainingAccounts } from "../target/types/unvalidated_remaining_accounts";

describe("unvalidated-remaining-accounts", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const payer = (anchor.getProvider().wallet as NodeWallet).payer;
  const program = anchor.workspace
    .UnvalidatedRemainingAccounts as anchor.Program<UnvalidatedRemainingAccounts>;

  it("accepts arbitrary remaining_accounts and writes without checks", async () => {
    // Create a wrapped SOL ATA to have a valid TokenAccount to pass
    const ata = await Token.createWrappedNativeAccount(
      program.provider.connection,
      TOKEN_PROGRAM_ID,
      payer.publicKey,
      payer,
      0
    );

    // Initialize a program-owned Data account
    const data = anchor.web3.Keypair.generate();
    await program.methods
      .initData()
      .accounts({ data: data.publicKey, payer: payer.publicKey, systemProgram: anchor.web3.SystemProgram.programId })
      .signers([data])
      .rpc();

    const sig = await program.methods
      .processWithoutValidation()
      .accounts({ payer: payer.publicKey, tokenProgram: TOKEN_PROGRAM_ID })
      .remainingAccounts([
        { pubkey: ata, isSigner: false, isWritable: false },
        { pubkey: data.publicKey, isSigner: false, isWritable: true },
      ])
      .rpc();
    const conf = await program.provider.connection.confirmTransaction(sig, "confirmed");
    assert.strictEqual(conf.value.err, null);
  });
});
