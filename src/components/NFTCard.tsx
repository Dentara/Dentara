'use client';

type NFTCardProps = {
  id: bigint | number;
  title: string;
  contractAddress: string;
};

export default function NFTCard({ id, title }: NFTCardProps) {
  const shortId = id.toString().slice(0, 8) + '...';

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition h-full flex flex-col justify-between items-center text-center">
      <div>
        <p className="text-xs text-gray-400 mb-1">NFT #{shortId}</p>
        <p className="font-semibold text-md text-gray-800" style={{ color: '#007B5E' }}>
          {title}
        </p>
      </div>
      <img
        src="https://i.pravatar.cc/300?u=nft-fallback"
        alt="NFT Fallback Image"
        className="mt-4 rounded-md object-cover w-full max-h-48 border"
      />
    </div>
  );
}
