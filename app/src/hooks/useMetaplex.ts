import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

const useMetaplex = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const metaplex = useMemo(() => Metaplex.make(connection).use(walletAdapterIdentity(wallet)), [connection, wallet]);

  return metaplex;
};

export default useMetaplex;