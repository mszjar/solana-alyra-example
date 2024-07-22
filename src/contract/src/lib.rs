use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

declare_id!("");

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

#[program]
mod mescena {
    use super::*;

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        choices: Vec<String>,
        deadline: u64,
    ) -> Result<()> {
        instructions::create_proposal(ctx, title, description, choices, deadline)
    }

    pub fn vote(ctx: Context<CastVote>, choice_index: u8) -> Result<()> {
        instructions::vote(ctx, choice_index)
    }

    /// Rewards the content creator by transferring SOL from a user.
    pub fn reward_content_creator(ctx: Context<RewardContentCreator>) -> Result<()> {
      let amount = 100_000_000; // 0.1 SOL in lamports

      let ix = anchor_lang::solana_program::system_instruction::transfer(
          &ctx.accounts.user.key(),
          &ctx.accounts.recipient.key(),
          amount,
      );
      anchor_lang::solana_program::program::invoke(
          &ix,
          &[
              ctx.accounts.user.to_account_info(),
              ctx.accounts.recipient.to_account_info(),
              ctx.accounts.system_program.to_account_info(),
          ],
      )?;

      Ok(())
  }
}

#[derive(Accounts)]
pub struct RewardContentCreator<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
