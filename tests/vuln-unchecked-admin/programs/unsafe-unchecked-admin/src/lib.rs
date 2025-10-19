use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod unsafe_unchecked_admin {
    use super::*;

    pub fn privileged_action(ctx: Context<PrivilegedAction>) -> Result<()> {
        // Vulnerable: attacker can control `admin` unchecked account; no signer/owner checks
        msg!("Privileged action executed by {:?}", ctx.accounts.admin.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct PrivilegedAction<'info> {
    /// CHECK: admin unchecked, no signer or owner check
    pub admin: UncheckedAccount<'info>,
}
