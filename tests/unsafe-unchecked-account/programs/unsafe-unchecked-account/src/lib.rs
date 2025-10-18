use anchor_lang::prelude::*;

declare_id!("QB7FhB7nRdL18x8teKV5LsiYCP8YnduXZUVye4kfoWr");

#[program]
mod unsafe_unchecked_account {
    use super::*;

    pub fn privileged_action(ctx: Context<PrivilegedAction>) -> Result<()> {
        // Vulnerable: attacker controls `admin` unchecked account
        msg!("Privileged action executed by {:?}", ctx.accounts.admin.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct PrivilegedAction<'info> {
    /// CHECK: admin unchecked, no signer or owner check
    pub admin: UncheckedAccount<'info>,
}
