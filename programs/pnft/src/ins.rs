use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token};
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeVault<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    init,
    payer = authority,
    space = Vault::LEN + 8,
    seeds = [
      b"vault".as_ref(),
    ],
    bump,
  )]
  pub vault: Box<Account<'info, Vault>>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
  #[account(mut)]
  pub staker: Signer<'info>,

  #[account(
    mut,
    seeds = [
      b"vault".as_ref(),
    ],
    bump = vault.bump,
  )]
  pub vault: Box<Account<'info, Vault>>,
  
  pub mint: Box<Account<'info, Mint>>,

  #[account(
    mut,
    associated_token::mint = mint,
    associated_token::authority = staker,
  )]
  pub staker_ata: Box<Account<'info, TokenAccount>>,

  /// CHECK:
  #[account(mut)]
  pub metadata: AccountInfo<'info>,

  /// CHECK:
  pub edition: AccountInfo<'info>,

  /// CHECK:
  #[account(mut)]
  pub token_record: AccountInfo<'info>,

  /// CHECK:
  pub sysvar_instructions: AccountInfo<'info>,

  /// CHECK:
  pub token_metadata_program: AccountInfo<'info>,

  /// CHECK:
  pub authorization_rules_program: AccountInfo<'info>,

  /// CHECK:
  pub authorization_rules: AccountInfo<'info>,

  pub token_program: Program<'info, Token>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
  #[account(mut)]
  pub staker: Signer<'info>,

  #[account(
    mut,
    seeds = [
      b"vault".as_ref(),
    ],
    bump = vault.bump,
  )]
  pub vault: Box<Account<'info, Vault>>,
  
  pub mint: Box<Account<'info, Mint>>,

  #[account(
    mut,
    associated_token::mint = mint,
    associated_token::authority = staker,
  )]
  pub staker_ata: Box<Account<'info, TokenAccount>>,

  /// CHECK:
  #[account(mut)]
  pub metadata: AccountInfo<'info>,

  /// CHECK:
  pub edition: AccountInfo<'info>,

  /// CHECK:
  #[account(mut)]
  pub token_record: AccountInfo<'info>,

  /// CHECK:
  pub sysvar_instructions: AccountInfo<'info>,

  /// CHECK:
  pub token_metadata_program: AccountInfo<'info>,

  /// CHECK:
  pub authorization_rules_program: AccountInfo<'info>,

  /// CHECK:
  pub authorization_rules: AccountInfo<'info>,

  pub token_program: Program<'info, Token>,

  pub system_program: Program<'info, System>,
}