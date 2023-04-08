import { PublicKey } from '@solana/web3.js'

export type NftData = {
  mint: PublicKey;
  name: string;
  symbol: string;
  image: string;
}

export type Token = {
  mint: string;
  symbol: string;
  decimals: number;
  uiAmount: number;
  price: number;
  state: string;
}