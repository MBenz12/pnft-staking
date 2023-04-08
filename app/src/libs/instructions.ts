import { Program } from '@project-serum/anchor';
import { PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, SystemProgram } from '@solana/web3.js';
import { Pnft } from 'idl/pnft';
import { TOKEN_AUTH_RULES_ID, findEditionPda, findMetadataPda, findTokenRecordPda, findVaultPda } from './utils';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PROGRAM_ID as METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';

export const getInitializeVaultInstruction = async (
  program: Program<Pnft>,
  authority: PublicKey,
) => {
  const vault = findVaultPda();
  return await program.methods.initializeVault().accounts({
    authority,
    vault,
    systemProgram: SystemProgram.programId,
  }).instruction();
}

export const getStakeInstruction = async (
  program: Program<Pnft>,
  staker: PublicKey,
  mint: PublicKey,
) => {
  const vault = findVaultPda();
  const metadata = findMetadataPda(mint);
  const edition = findEditionPda(mint);
  const stakerAta = getAssociatedTokenAddressSync(mint, staker);
  const tokenRecord = findTokenRecordPda(mint, stakerAta);
  return await program.methods.stake().accounts({
    staker,
    vault,
    mint,
    stakerAta,
    metadata,
    edition,
    tokenRecord,
    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    tokenMetadataProgram: METADATA_PROGRAM_ID,
    authorizationRulesProgram: TOKEN_AUTH_RULES_ID,
    authorizationRules: PublicKey.default,
  }).instruction();
}

export const getUnstakeInstruction = async (
  program: Program<Pnft>,
  staker: PublicKey,
  mint: PublicKey,
) => {
  const vault = findVaultPda();
  const metadata = findMetadataPda(mint);
  const edition = findEditionPda(mint);
  const stakerAta = getAssociatedTokenAddressSync(mint, staker);
  const tokenRecord = findTokenRecordPda(mint, stakerAta);
  return await program.methods.unstake().accounts({
    staker,
    vault,
    mint,
    stakerAta,
    metadata,
    edition,
    tokenRecord,
    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    tokenMetadataProgram: METADATA_PROGRAM_ID,
    authorizationRulesProgram: TOKEN_AUTH_RULES_ID,
    authorizationRules: PublicKey.default,
  }).instruction();
}