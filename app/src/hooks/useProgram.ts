import { IDL, Pnft } from 'idl/pnft';
import { PROGRAM_ID } from 'libs/utils';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

const useProgram = () => {
  const anchorWallet = useAnchorWallet();
  const {connection} = useConnection();
  const [program, setProgram] = useState<Program<Pnft>>();

  useEffect(() => {
    if (!anchorWallet || !connection) return;

    const provider = new AnchorProvider(connection, anchorWallet, AnchorProvider.defaultOptions());
    const program = new Program(IDL, PROGRAM_ID.toString(), provider);
    setProgram(program);
  }, [anchorWallet, connection]);

  return program;
};

export default useProgram;