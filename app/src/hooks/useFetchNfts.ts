import { Nft } from '@metaplex-foundation/js';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { NftData } from 'types';
import useMetaplex from './useMetaplex';

const useFetchNfts = ({ reload }: { reload: {} }) => {
  const metaplex = useMetaplex();
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState<Array<NftData>>([]);
  const [assets, setAssets] = useState<Array<Nft>>([]);
  const [loading, setLoading] = useState(false);

  const fetchNfts = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const myAssets = (await metaplex.nfts().findAllByOwner({ owner: publicKey })).filter(nft =>
        nft.creators[0].address.toString() === "rM3fuvsBMTHsenB4cgF6uwBy9A7mZxJTJRNpBk2FeGf"
      );
      setAssets(myAssets.map(assert => assert as Nft));
      const nfts: Array<NftData> = [];
      myAssets.forEach(nft => {

        nfts.push({
          // @ts-ignore
          mint: nft.mintAddress,
          name: nft.name,
          symbol: nft.symbol,
          image: '',
        });
      });

      await Promise.all(nfts.map(async (nft, index) => {
        try {
          const { data: { image } } = await axios.get(myAssets[index].uri);
          nft.image = image;
        } catch (error) {
          //
        }
      }));

      nfts.sort((a, b) => a.name === b.name ? 0 : (a.name > b.name ? 1 : -1));
      setNfts(nfts);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }, [metaplex, publicKey]);

  useEffect(() => {
    fetchNfts();
  }, [fetchNfts, metaplex, publicKey, reload]);

  return { nfts, loading, assets };
};

export default useFetchNfts;