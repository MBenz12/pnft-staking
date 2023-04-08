import { createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection, TransactionInstruction, Transaction, PublicKey } from '@solana/web3.js';
import { DEBUG, SKIP_PREFLIGHT } from 'config';
import { PROGRAM_ID as METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import idl from 'idl/pnft.json';

export const TOKEN_AUTH_RULES_ID = new PublicKey("auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg");
export const PROGRAM_ID = new PublicKey(idl.metadata.address);

export const sendTransaction = async (
  wallet: WalletContextState,
  connection: Connection,
  instruction: TransactionInstruction,
  skipPreflight: boolean = SKIP_PREFLIGHT,
  confirmationSafe: boolean = false,
) => {
  try {
    const transaction = new Transaction();
    transaction.add(instruction);
    const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight });
    DEBUG && console.log(txSignature);
    await confirmTransactionSafe(connection, txSignature, confirmationSafe);
    return txSignature;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const getRecentBlockhash = async (connection: Connection) => {
  return (await connection.getLatestBlockhash('finalized')).blockhash;
}

export const sendTransactions = async (
  wallet: WalletContextState,
  connection: Connection,
  instructions: Array<TransactionInstruction>,
  skipPreflight: boolean = SKIP_PREFLIGHT,
  confirmationSafe: boolean = false,
) => {
  if (!wallet.publicKey || !wallet.signAllTransactions) return;
  try {
    const transactions = [];
    let transaction = new Transaction();
    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = await getRecentBlockhash(connection);
    for (const instruction of instructions) {
      const tempTransaction = new Transaction();
      tempTransaction.instructions = [...transaction.instructions];
      transaction.add(instruction);
      let bytes = 0;
      try {
        bytes = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).length;
      } catch (error) {
        bytes = 1232 + 1;
      }
      if (bytes > 1232) {
        transactions.push(tempTransaction);
        transaction.instructions = [];
      }
    }
    if (transaction.instructions.length) transactions.push(transaction);
    const recentBlockhash = await getRecentBlockhash(connection);
    for (const transaction of transactions) {
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = recentBlockhash;
    }
    const signedTxns = await wallet.signAllTransactions(transactions);
    const txSignatures = await Promise.all(signedTxns.map(async (signedTxn) => {
      const txSignature = await connection.sendRawTransaction(signedTxn.serialize(), { skipPreflight });
      DEBUG && console.log(txSignature);
      return txSignature;
    }));
    await Promise.all(txSignatures.map(async (txSignature) => {
      await confirmTransactionSafe(connection, txSignature, confirmationSafe);
    }));
    return txSignatures;
  } catch (error) {
    console.log(error);
    return null;
  }
}


const sleep = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function confirmTransactionSafe(
  connection: Connection,
  txSignature: string,
  safe: boolean = true,
  retries: number = 10,
  sleepMS: number = 1000
) {
  if (safe) {
    return await connection.confirmTransaction(txSignature, "confirmed");
  }

  let isConfirmed = false;
  let confirmationResult = null;
  while (!isConfirmed && retries > 0) {
    try {
      DEBUG && console.log(`Confirming ${txSignature}... retries: ${retries}`);
      confirmationResult = await connection.confirmTransaction(txSignature, "confirmed");
      DEBUG && console.log(`Confirmed ${txSignature}`);
      isConfirmed = true;
    }
    catch (e) {
      DEBUG && console.info("Failed confirmation:", e);
      retries--;
      await sleep(sleepMS);
    }
  }
  return confirmationResult;
}

export async function getCreateAtaInstruction(connection: Connection, payer: PublicKey, ata: PublicKey, mint: PublicKey, owner: PublicKey) {
  let account = await connection.getAccountInfo(ata);
  if (!account) {
    return createAssociatedTokenAccountInstruction(
      payer,
      ata,
      owner,
      mint,
    );
  }
}

export const findMetadataPda = (mint: PublicKey) => {
  const [metadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf8"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
  return metadata;
};

export const findEditionPda = (mint: PublicKey) => {
  const [edition] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    METADATA_PROGRAM_ID
  );
  return edition;
}

export function findTokenRecordPda(mint: PublicKey, token: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from('token_record'),
      token.toBuffer(),
    ],
    METADATA_PROGRAM_ID,
  )[0];
}

export const findVaultPda = () => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("vault"),
    ],
    PROGRAM_ID,
  )[0];
}