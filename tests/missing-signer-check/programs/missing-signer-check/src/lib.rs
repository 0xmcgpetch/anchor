use anchor_lang::prelude::*;

// Use the well-known test program ID for simplicity in localnet examples
// This is fine for local validator; on devnet you'd redeploy and update Anchor.toml

declare_id!("EUFqStpHaAdFnLVpfykXhvah1obeh6suB9XeFU9DTxdU");

#[program]
pub mod missing_signer_check {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = authority;
        Ok(())
    }

    // VULNERABLE: Missing signer check on old authority.
    // Anyone can set new authority by just passing the old authority pubkey.
    pub fn update_authority(ctx: Context<UpdateAuthority>, new_authority: Pubkey) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        // BUG: Should ensure old_authority is signer, but doesn't.
        // require_keys_eq!(vault.authority, ctx.accounts.old_authority.key());
        // require!(ctx.accounts.old_authority.is_signer, CustomError::Unauthorized);
        require_keys_eq!(vault.authority, ctx.accounts.old_authority.key());
        vault.authority = new_authority;
        Ok(())
    }
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + 32)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    /// CHECK: Intentionally unchecked and not required to be a signer
    pub old_authority: UncheckedAccount<'info>,
}

#[error_code]
pub enum CustomError {
    #[msg("Unauthorized")]
    Unauthorized,
}
