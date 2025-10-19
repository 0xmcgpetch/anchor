import * as anchor from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { assert } from "chai";

import type { UnsafeUncheckedAdmin } from "../target/types/unsafe_unchecked_admin";

describe("unsafe-unchecked-admin", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace
    .UnsafeUncheckedAdmin as anchor.Program<UnsafeUncheckedAdmin>;

  it("accepts arbitrary admin without signer or owner checks", async () => {
    const arbitraryAdmin = anchor.web3.Keypair.generate();
    // Do NOT add arbitraryAdmin to signers; not a signer, not owned by program
    const txSig = await program.methods
      .privilegedAction()
      .accounts({ admin: arbitraryAdmin.publicKey })
      .rpc();

    // If the program didn't enforce signer/owner, the tx should succeed
    const confirmed = await program.provider.connection.confirmTransaction(
      txSig,
      "confirmed"
    );
    assert.strictEqual(confirmed.value.err, null);
  });
});
