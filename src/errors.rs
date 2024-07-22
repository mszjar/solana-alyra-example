use anchor_lang::prelude::*;

#[error_code]
pub enum VoteError {
    #[msg("Too many choices")]
    NotManyChoices,
    #[msg("Proposal is closed")]
    ProposalIsOver,
    #[msg("Choice index invalid")]
    ChoiceIndexOutOfScope,
}