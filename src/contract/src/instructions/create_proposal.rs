use anchor_lang::prelude::*;
use crate::constants::MAX_COUNT_OF_CHOICES;
use crate::errors::VoteError;
use crate::state::{Choice, Proposal};

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    title: String,
    description: String,
    choices: Vec<String>,
    deadline: u64,
) -> Result<()> {
    let proposal_account = &mut ctx.accounts.proposal;

    // Verify < 10 choices or return error
    require!(
        choices.len() <= MAX_COUNT_OF_CHOICES,
        VoteError::NotManyChoices
    );

    proposal_account.title = title;
    proposal_account.description = description;
    proposal_account.deadline = deadline;

    let mut vec_choices = Vec::new();

    for choice in choices {
        let option = Choice {
            label: choice,
            count: 0,
        };

        vec_choices.push(option);
    }

    proposal_account.choices = vec_choices;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(init, payer = signer, space = 8 + 32 + 32 + (32 + 8) * MAX_COUNT_OF_CHOICES + 8)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}