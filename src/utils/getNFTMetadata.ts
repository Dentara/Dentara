import { ethers } from 'ethers';

const abi = [
  'function tokenURI(uint256 tokenId) view returns (string)',
];

export async function getNFTMetadata({
  contractAddress,
  tokenId,
  rpcUrl = 'https://eth-mainnet.g.alchemy.com/v2/demo', // öz URL-n varsa dəyişə bilərsən
}: {
  contractAddress: string;
  tokenId: bigint;
  rpcUrl?: string;
}) {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const tokenURI = await contract.tokenURI(tokenId);

    const url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
    const res = await fetch(url);
    const metadata = await res.json();

    return {
      tokenURI: url,
      metadata,
    };
  } catch (err) {
    console.error('getNFTMetadata error:', err);
    return null;
  }
}
