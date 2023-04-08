import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useFetchTokens } from 'hooks/useFetchTokens';
import { useState } from 'react';

export default function Token() {
  const [reload] = useState({});
  const { tokens } = useFetchTokens(reload);

  console.log(tokens);

  return (
    <div>
      <WalletMultiButton />
    </div>
  )
}