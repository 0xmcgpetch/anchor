use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Token};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod unvalidated_remaining_accounts {
    use super::*;

    pub fn init_data(ctx: Context<InitData>) -> Result<()> {
        // Initialize with zeroes
        ctx.accounts.data.buf = [0u8; 8];
        Ok(())
    }

    pub fn process_without_validation<'c: 'info, 'info>(
        ctx: Context<'_, '_, 'c, 'info, NoValidation>,
    ) -> Result<()> {
        // Pull accounts from remaining_accounts without validating owner/signature
        let mut it = ctx.remaining_accounts.iter();
        let token_account_info = next_account_info(&mut it)?;
        let target_data_info = next_account_info(&mut it)?;

        // Deserialize token account unchecked and read owner field
        let token_acc = Account::<TokenAccount>::try_from_unchecked(token_account_info)?;
        msg!("Using remaining token account from {:?}", token_acc.owner);

        // Deserialize our program-owned Data unchecked and write without using typed accounts
        let mut data_acc = Account::<Data>::try_from_unchecked(target_data_info)?;
        let payer_key = ctx.accounts.payer.key();
        data_acc.buf.copy_from_slice(&payer_key.to_bytes()[..8]);
        data_acc.exit(ctx.program_id)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct NoValidation<'info> {
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitData<'info> {
    #[account(init, payer = payer, space = 8 + 8)]
    pub data: Account<'info, Data>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Data {
    pub buf: [u8; 8],
}
