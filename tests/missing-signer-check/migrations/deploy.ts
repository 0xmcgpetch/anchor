import * as anchor from "@coral-xyz/anchor";

export default async function (provider: anchor.AnchorProvider) {
  anchor.setProvider(provider);
}
