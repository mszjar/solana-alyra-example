use anchor_lang::prelude::*;

#[account]
pub struct Voter {
    pub proposal: Pubkey,
    pub user: Pubkey,
    pub choice_index: u8,
}
