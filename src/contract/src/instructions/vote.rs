use anchor_lang::prelude::*;
use crate::errors::VoteError;
use crate::state::{Proposal, Voter};

pub fn vote(ctx: Context<CastVote>, choice_index: u8) -> Result<()> {
    let proposal_account = &mut ctx.accounts.proposal;
    let voter_account = &mut ctx.accounts.voter;

    require!(
        Clock::get()?.unix_timestamp < proposal_account.deadline as i64,
        VoteError::ProposalIsOver
    );

    require!(
        proposal_account.choices.len() as u8 > choice_index,
        VoteError::ChoiceIndexOutOfScope
    );

    proposal_account.choices[choice_index as usize].count += 1;

    voter_account.choice_index = choice_index;
    voter_account.proposal = proposal_account.key();
    voter_account.user = ctx.accounts.signer.key();

    Ok(())
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(init, payer = signer, space = 8 + 32 + 32 + 1 + 1, seeds = [proposal.key().as_ref(), signer.key().as_ref()], bump)]
    pub voter: Account<'info, Voter>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
