import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import NftCard from 'components/NftCard';
import useFetchNfts from 'hooks/useFetchNfts';
import useProgram from 'hooks/useProgram';
import { initializeVault, stake, unstake } from 'libs/methods';
import { useState } from 'react';

export default function Home() {
  const program = useProgram();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [reload] = useState({});
  const { nfts, loading } = useFetchNfts({ reload });
  const [selectedNftIndex, setSelectedNftIndex] = useState(-1);

  const handleInitialize = async () => {
    if (!program || !wallet.publicKey) return;

    const txn = await initializeVault(program, wallet);
    console.log(txn);
  };

  const handleStake = async () => {
    if (!program || !wallet.publicKey || selectedNftIndex === -1) return;

    const txn = await stake(program, wallet, nfts[selectedNftIndex].mint);
    console.log(txn);
  }

  const handleUnstake = async () => {
    if (!program || !wallet.publicKey || selectedNftIndex === -1) return;

    const txn = await unstake(program, wallet, nfts[selectedNftIndex].mint);
    console.log(txn);
  }

  return (
    <div className='flex justify-center'>
      <div className='container flex flex-col items-center justify-center gap-5 min-h-screen'>
        <div><WalletMultiButton /></div>
        {publicKey &&
          <>
            {loading ?
              <div>Loading...</div> :
              <>
                <div className='flex gap-1'>
                  <button className='button' onClick={handleInitialize}>Initialize</button>
                  <button className='button' onClick={handleStake}>Stake</button>
                  <button className='button' onClick={handleUnstake}>Unstake</button>
                </div>
                <div className='grid grid-cols-6 gap-2'>
                  {nfts.map((nft, index) => (
                    <NftCard
                      key={nft.mint.toString()}
                      nft={nft}
                      selected={index === selectedNftIndex}
                      onSelect={() => {
                        if (index === selectedNftIndex) {
                          setSelectedNftIndex(-1);
                        } else {
                          setSelectedNftIndex(index);
                        }
                      }}
                    />
                  ))}
                </div>
              </>
            }
          </>
        }
      </div>
    </div>
  )
};