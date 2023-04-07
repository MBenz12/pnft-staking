mod state;
mod ins;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::Instruction, 
    program::{invoke, invoke_signed}
};
use mpl_token_metadata::{
    instruction::{MetadataInstruction, DelegateArgs, LockArgs, UnlockArgs, RevokeArgs}, 
    state::{TokenRecord, TokenMetadataAccount},
};
use ins::*;

declare_id!("HPmsRXtcs41XciPbjRztDPrm8cCki7E6h7DxCQSaRdMv");

#[program]
pub mod pnft {

    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        vault.bump = *ctx.bumps.get("vault").unwrap();

        Ok(())
    }

    pub fn stake(ctx: Context<Stake>) -> Result<()> {
        let token_record = <TokenRecord as TokenMetadataAccount>::from_account_info(&ctx.accounts.token_record.to_account_info()).unwrap();
        if token_record.delegate.is_some() {
            invoke(
                &Instruction {
                    program_id: mpl_token_metadata::id(),
                    accounts: vec![
                        // 0. `[writable]` Delegate record account
                        AccountMeta::new_readonly(mpl_token_metadata::id(), false),
                        // 1. `[]` Delegated owner
                        AccountMeta::new_readonly(ctx.accounts.vault.key(), false),
                        // 2. `[writable]` Metadata account
                        AccountMeta::new(ctx.accounts.metadata.key(), false),
                        // 3. `[optional]` Master Edition account
                        AccountMeta::new_readonly(ctx.accounts.edition.key(), false),
                        // 4. `[]` Token record
                        AccountMeta::new(ctx.accounts.token_record.key(), false),
                        // 5. `[]` Mint account
                        AccountMeta::new_readonly(ctx.accounts.mint.key(), false),
                        // 6. `[optional, writable]` Token account
                        AccountMeta::new(ctx.accounts.staker_ata.key(), false),
                        // 7. `[signer]` Approver (update authority or token owner) to approve the delegation
                        AccountMeta::new_readonly(ctx.accounts.staker.key(), true),
                        // 8. `[signer, writable]` Payer
                        AccountMeta::new(ctx.accounts.staker.key(), true),
                        // 9. `[]` System Program
                        AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                        // 10. `[]` Instructions sysvar account
                        AccountMeta::new_readonly(ctx.accounts.sysvar_instructions.key(), false),
                        // 11. `[optional]` SPL Token Program
                        AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
                        // 12. `[optional]` Token Authorization Rules program
                        AccountMeta::new_readonly(ctx.accounts.authorization_rules_program.key(), false),
                        // 13. `[optional]` Token Authorization Rules account
                        AccountMeta::new_readonly(ctx.accounts.authorization_rules.key(), false),
                    ],
                    data: MetadataInstruction::Revoke(RevokeArgs::LockedTransferV1 {})
                    .try_to_vec()
                    .unwrap(),
                },
                &[
                    ctx.accounts.vault.to_account_info(),
                    ctx.accounts.metadata.to_account_info(),
                    ctx.accounts.edition.to_account_info(),
                    ctx.accounts.token_record.to_account_info(),
                    ctx.accounts.mint.to_account_info(),
                    ctx.accounts.staker_ata.to_account_info(),
                    ctx.accounts.staker.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                    ctx.accounts.sysvar_instructions.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.authorization_rules_program.to_account_info(),
                    ctx.accounts.authorization_rules.to_account_info(),
                ],
            )?;
        }
        
        invoke(
            &Instruction {
                program_id: mpl_token_metadata::id(),
                accounts: vec![
                    // 0. `[writable]` Delegate record account
                    AccountMeta::new_readonly(mpl_token_metadata::id(), false),
                    // 1. `[]` Delegated owner
                    AccountMeta::new_readonly(ctx.accounts.vault.key(), false),
                    // 2. `[writable]` Metadata account
                    AccountMeta::new(ctx.accounts.metadata.key(), false),
                    // 3. `[optional]` Master Edition account
                    AccountMeta::new_readonly(ctx.accounts.edition.key(), false),
                    // 4. `[]` Token record
                    AccountMeta::new(ctx.accounts.token_record.key(), false),
                    // 5. `[]` Mint account
                    AccountMeta::new_readonly(ctx.accounts.mint.key(), false),
                    // 6. `[optional, writable]` Token account
                    AccountMeta::new(ctx.accounts.staker_ata.key(), false),
                    // 7. `[signer]` Approver (update authority or token owner) to approve the delegation
                    AccountMeta::new_readonly(ctx.accounts.staker.key(), true),
                    // 8. `[signer, writable]` Payer
                    AccountMeta::new(ctx.accounts.staker.key(), true),
                    // 9. `[]` System Program
                    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                    // 10. `[]` Instructions sysvar account
                    AccountMeta::new_readonly(ctx.accounts.sysvar_instructions.key(), false),
                    // 11. `[optional]` SPL Token Program
                    AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
                    // 12. `[optional]` Token Authorization Rules program
                    AccountMeta::new_readonly(ctx.accounts.authorization_rules_program.key(), false),
                    // 13. `[optional]` Token Authorization Rules account
                    AccountMeta::new_readonly(ctx.accounts.authorization_rules.key(), false),
                ],
                data: MetadataInstruction::Delegate(DelegateArgs::LockedTransferV1 {
                    amount: 1,
                    locked_address: ctx.accounts.vault.key(),
                    authorization_data: None,
                })
                .try_to_vec()
                .unwrap(),
            },
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.edition.to_account_info(),
                ctx.accounts.token_record.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.staker_ata.to_account_info(),
                ctx.accounts.staker.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.sysvar_instructions.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.authorization_rules_program.to_account_info(),
                ctx.accounts.authorization_rules.to_account_info(),
            ],
        )?;

        let vault = &ctx.accounts.vault;
        let bump = vault.bump;
        let seeds = &[
            b"vault".as_ref(),
            &[bump],
        ];
        invoke_signed(
            &Instruction {
                program_id: mpl_token_metadata::id(),
                accounts: vec![
                    // 0. `[signer]` Delegate
                    AccountMeta::new_readonly(ctx.accounts.vault.key(), true),
                    // 1. `[optional]` Token owner
                    AccountMeta::new_readonly(ctx.accounts.staker.key(), false),
                    // 2. `[writable]` Token account
                    AccountMeta::new(ctx.accounts.staker_ata.key(), false),
                    // 3. `[]` Mint account
                    AccountMeta::new_readonly(ctx.accounts.mint.key(), false),
                    // 4. `[writable]` Metadata account
                    AccountMeta::new(ctx.accounts.metadata.key(), false),
                    // 5. `[optional]` Edition account
                    AccountMeta::new_readonly(ctx.accounts.edition.key(), false),
                    // 6. `[optional, writable]` Token record account
                    AccountMeta::new(ctx.accounts.token_record.key(), false),
                    // 7. `[signer, writable]` Payer
                    AccountMeta::new(ctx.accounts.staker.key(), true),
                    // 8. `[]` System Program
                    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                    // 9. `[]` Instructions sysvar account
                    AccountMeta::new_readonly(ctx.accounts.sysvar_instructions.key(), false),
                    // 10. `[optional]` SPL Token Program
                    AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
                    // 11. `[optional]` Token Authorization Rules program
                    AccountMeta::new_readonly(ctx.accounts.authorization_rules_program.key(), false),
                    // 12. `[optional]` Token Authorization Rules account
                    AccountMeta::new_readonly(ctx.accounts.authorization_rules.key(), false),
                ],
                data: MetadataInstruction::Lock(LockArgs::V1 { authorization_data: None }).try_to_vec().unwrap(),
            },
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.edition.to_account_info(),
                ctx.accounts.token_record.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.staker_ata.to_account_info(),
                ctx.accounts.staker.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.sysvar_instructions.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.authorization_rules_program.to_account_info(),
                ctx.accounts.authorization_rules.to_account_info(),
            ],
            &[seeds],
        )?;
        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        let vault = &ctx.accounts.vault;
        let bump = vault.bump;
        let seeds = &[
            b"vault".as_ref(),
            &[bump],
        ];
        invoke_signed(
            &Instruction {
                program_id: mpl_token_metadata::id(),
                accounts: vec![
                    // 0. `[signer]` Delegate
                    AccountMeta::new_readonly(ctx.accounts.vault.key(), true),
                    // 1. `[optional]` Token owner
                    AccountMeta::new_readonly(ctx.accounts.staker.key(), false),
                    // 2. `[writable]` Token account
                    AccountMeta::new(ctx.accounts.staker_ata.key(), false),
                    // 3. `[]` Mint account
                    AccountMeta::new_readonly(ctx.accounts.mint.key(), false),
                    // 4. `[writable]` Metadata account
                    AccountMeta::new(ctx.accounts.metadata.key(), false),
                    // 5. `[optional]` Edition account
                    AccountMeta::new_readonly(ctx.accounts.edition.key(), false),
                    // 6. `[optional, writable]` Token record account
                    AccountMeta::new(ctx.accounts.token_record.key(), false),
                    // 7. `[signer, writable]` Payer
                    AccountMeta::new(ctx.accounts.staker.key(), true),
                    // 8. `[]` System Program
                    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                    // 9. `[]` Instructions sysvar account
                    AccountMeta::new_readonly(ctx.accounts.sysvar_instructions.key(), false),
                    // 10. `[optional]` SPL Token Program
                    AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
                    // 11. `[optional]` Token Authorization Rules program
                    AccountMeta::new_readonly(mpl_token_metadata::id(), false),
                    // 12. `[optional]` Token Authorization Rules account
                    AccountMeta::new_readonly(mpl_token_metadata::id(), false),
                ],
                data: MetadataInstruction::Unlock(UnlockArgs::V1 {
                    authorization_data: None,
                })
                .try_to_vec()
                .unwrap(),
            },
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.staker.to_account_info(),
                ctx.accounts.staker_ata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.edition.to_account_info(),
                ctx.accounts.token_record.to_account_info(),
                ctx.accounts.staker.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.sysvar_instructions.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
            &[seeds],
        )?;

        invoke(
            &Instruction {
                program_id: mpl_token_metadata::id(),
                accounts: vec![
                    // 0. `[writable]` Delegate record account
                    AccountMeta::new_readonly(mpl_token_metadata::id(), false),
                    // 1. `[]` Delegated owner
                    AccountMeta::new_readonly(ctx.accounts.vault.key(), false),
                    // 2. `[writable]` Metadata account
                    AccountMeta::new(ctx.accounts.metadata.key(), false),
                    // 3. `[optional]` Master Edition account
                    AccountMeta::new_readonly(ctx.accounts.edition.key(), false),
                    // 4. `[]` Token record
                    AccountMeta::new(ctx.accounts.token_record.key(), false),
                    // 5. `[]` Mint account
                    AccountMeta::new_readonly(ctx.accounts.mint.key(), false),
                    // 6. `[optional, writable]` Token account
                    AccountMeta::new(ctx.accounts.staker_ata.key(), false),
                    // 7. `[signer]` Approver (update authority or token owner) to approve the delegation
                    AccountMeta::new_readonly(ctx.accounts.staker.key(), true),
                    // 8. `[signer, writable]` Payer
                    AccountMeta::new(ctx.accounts.staker.key(), true),
                    // 9. `[]` System Program
                    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                    // 10. `[]` Instructions sysvar account
                    AccountMeta::new_readonly(ctx.accounts.sysvar_instructions.key(), false),
                    // 11. `[optional]` SPL Token Program
                    AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
                    // 12. `[optional]` Token Authorization Rules program
                    AccountMeta::new_readonly(ctx.accounts.authorization_rules_program.key(), false),
                    // 13. `[optional]` Token Authorization Rules account
                    AccountMeta::new_readonly(ctx.accounts.authorization_rules.key(), false),
                ],
                data: MetadataInstruction::Revoke(RevokeArgs::LockedTransferV1 {})
                .try_to_vec()
                .unwrap(),
            },
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.edition.to_account_info(),
                ctx.accounts.token_record.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.staker_ata.to_account_info(),
                ctx.accounts.staker.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.sysvar_instructions.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.authorization_rules_program.to_account_info(),
                ctx.accounts.authorization_rules.to_account_info(),
            ],
        )?;
        Ok(())
    }
}