import { Program } from '@project-serum/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Pnft } from 'idl/pnft';
import { getInitializeVaultInstruction, getStakeInstruction, getUnstakeInstruction } from './instructions';
import { sendTransaction } from './utils';
import { PublicKey } from '@solana/web3.js';

export const initializeVault = async (
  program: Program<Pnft>,
  wallet: WalletContextState,
) => {
  if (!wallet.publicKey) return;

  let instruction = await getInitializeVaultInstruction(program, wallet.publicKey);

  return await sendTransaction(wallet, program.provider.connection, instruction);
}

export const stake = async (
  program: Program<Pnft>,
  wallet: WalletContextState,
  mint: PublicKey,
) => {
  if (!wallet.publicKey) return;

  let instruction = await getStakeInstruction(program, wallet.publicKey, mint);

  return await sendTransaction(wallet, program.provider.connection, instruction);
}

export const unstake = async (
  program: Program<Pnft>,
  wallet: WalletContextState,
  mint: PublicKey,
) => {
  if (!wallet.publicKey) return;

  let instruction = await getUnstakeInstruction(program, wallet.publicKey, mint);

  return await sendTransaction(wallet, program.provider.connection, instruction);
}