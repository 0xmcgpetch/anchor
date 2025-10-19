use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[account]
pub struct MyData {
    pub value: u64,
}

#[account]
pub struct OtherData {
    pub something: u64,
}

#[program]
pub mod missing_discriminator {
    use super::*;

    pub fn read_unchecked(ctx: Context<WriteUnchecked>) -> Result<()> {
        // Vulnerability demo: bypass discriminator check via try_deserialize_unchecked
        let acc_info = ctx.accounts.any_account.to_account_info();
        let mut data: &[u8] = &acc_info.try_borrow_data()?;
        let my: MyData = MyData::try_deserialize_unchecked(&mut data)?;
        msg!("Read value without discriminator check: {}", my.value);
        Ok(())
    }

    pub fn write_wrong_disc(ctx: Context<WriteUnchecked>, disc: [u8; 8]) -> Result<()> {
        // Overwrite discriminator bytes directly
        let acc_info = ctx.accounts.any_account.to_account_info();
        let mut data = acc_info.try_borrow_mut_data()?;
        data[..8].copy_from_slice(&disc);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Init<'info> {
    #[account(init, payer = payer, space = 8 + 8)]
    pub my_data: Account<'info, MyData>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WriteUnchecked<'info> {
    #[account(mut)]
    /// CHECK: intentionally unchecked, will be deserialized unchecked
    pub any_account: UncheckedAccount<'info>,
}
