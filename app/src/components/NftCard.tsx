import { NftData } from 'types';

const NftCard = ({ nft, selected, onSelect }: { nft: NftData, selected: boolean, onSelect: () => void }) => {
  return (
    <div onClick={onSelect} className='flex flex-col relative items-center rounded-md'>
      {selected && <div className='absolute w-2 h-2 right-2 top-2 rounded-full bg-[#512da8]' />}
      <div className='w-full h-full'>
        <img src={nft.image} alt='' />
      </div>
      <p>{nft.name}</p>
    </div>
  );
};

export default NftCard;