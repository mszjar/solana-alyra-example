use anchor_lang::prelude::*;

declare_id!("7bKQHpvkTQsPVkmNXtpVXFczbqiiSwt4KYevEVWrLtLU");

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
    //pub fn reward(ctx: Context<RewardContentCreator>, amount: u64) -> Result<()> {
        //instructions::reward(ctx, amount)
    //}

    /// Rewards the content creator by transferring SOL from a user.
    pub fn reward_content_creator(ctx: Context<RewardContentCreator>, amount: u64) -> Result<()> {
        let user = &mut ctx.accounts.user;

        // Ensure the user has enough rewards to deduct
        //if user.rewards < amount {
            //return Err(ErrorCode::InsufficientFunds.into());
        //}

        // Deduct rewards from the user
        user.rewards -= amount;

        // Transfer SOL from user to content creator
        let user_info = ctx.accounts.user.to_account_info();
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &user_info.key,
            &ctx.accounts.content_creator.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[user_info, ctx.accounts.content_creator.to_account_info()],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct RewardContentCreator<'info> {
    #[account(mut)]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub content_creator: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct User {
    pub is_content_creator: bool,
    pub rewards: u64,
    pub voted_proposals: Vec<Pubkey>, // Track voted proposals
}