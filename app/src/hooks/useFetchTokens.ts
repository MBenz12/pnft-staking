import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { Token } from 'types';
import { HyperspaceClient } from "hyperspace-client-js";
import { HYPERSPACE_API_KEY } from 'config';
import useMetaplex from './useMetaplex';
import { PublicKey } from '@solana/web3.js';

const hsClient = new HyperspaceClient(HYPERSPACE_API_KEY);

export const useFetchTokens = (reload: {}) => {
  const [tokens, setTokens] = useState<Array<Token>>([]);
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const metaplex = useMetaplex();

  // const mnemonic = "";
  // const seed = bip39.mnemonicToSeedSync(mnemonic, "");
  // const keypair = Keypair.fromSeed(seed.slice(0, 32));
  // console.log(bs58.encode(keypair.secretKey));

  const fetchTokens = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const { value } = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      const tokens = value.map(token => {
        const { parsed } = token.account.data;
        const { tokenAmount: { decimals, uiAmount }, mint, state } = parsed["info"];
        return { mint, uiAmount, decimals, price: 0, state } as Token;
      }).filter(token => token.uiAmount && token.state !== "frozen");

      const mints = tokens.filter(token => !token.decimals).map(token => new PublicKey(token.mint));

      const nfts = await metaplex.nfts().findAllByMintList({ mints });

      const creators: { [key: string]: number } = {};
      nfts.forEach((nft) => {
        const creator = nft?.creators.length ? nft?.creators[0].address : PublicKey.default;
        creators[creator.toString()] = 0;
      });

      try {
        const priceResponse = await (
          await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd", {
            method: 'GET',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
        ).json();
        const solPrice = parseFloat(priceResponse.solana.usd) || 0;
        const projectIds = Object.keys(creators);
        for (let i = 0; i < projectIds.length; i += 10) {
          try {
            const res = await hsClient.getProjects({ condition: { projectIds: projectIds.slice(i * 10, (i + 1) * 10) } });
            for (const project of res.getProjectStats.project_stats || []) {
              const creator = project.project_id;
              creators[creator] = (project.floor_price || 0) * solPrice;
            }
          } catch (error) {
            console.log("63----", error);
          }
        }
      } catch (error) {
        console.log("67----", error);
      }

      await Promise.all(tokens.map(async (token) => {
        if (token.decimals) {
          try {
            const priceResponse = await (
              await fetch(`https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${token.mint}&vs_currencies=usd`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
              })
            ).json();
            if (priceResponse[token.mint]) {
              token.price = parseFloat(priceResponse[token.mint].usd) || 0;
            }
          } catch (error) {
            console.log("85---", error);
          }
        } else {
          let nft = nfts[mints.map(mint => mint.toString()).indexOf(token.mint)];
          const creator = nft?.creators.length ? nft?.creators[0].address : PublicKey.default;
          token.price = creators[creator.toString()];
        }
      }));

      tokens.sort((a, b) => b.uiAmount * b.price - a.uiAmount * a.price);
      setTokens(tokens.filter(token => token.uiAmount * token.price));
    } catch (error) {
      console.log("98---", error);
    }
    setLoading(false);
  }, [connection, publicKey, metaplex]);

  useEffect(() => {
    fetchTokens();
  }, [reload, publicKey, fetchTokens]);

  return { tokens, loading };
};