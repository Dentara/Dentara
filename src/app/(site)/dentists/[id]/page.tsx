import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata } from 'next';
import NFTCard from '@/components/NFTCard';
import ReviewList from '@/components/ReviewList';

const dummyDentists = [
  {
    id: 'jane-doe',
    name: 'Dr. Jane Doe',
    specialty: 'Orthodontist',
    bio: 'Experienced orthodontist with 10+ years in clear aligner therapy.',
    image: 'https://i.pravatar.cc/300?u=jane-doe',
    nfts: [
      { id: 1, title: 'Orthodontics Diploma', contractAddress: '' },
      { id: 2, title: 'Clear Aligner Certificate', contractAddress: '' },
    ],
  },
  {
    id: 'john-smith',
    name: 'Dr. John Smith',
    specialty: 'Implantologist',
    bio: 'Expert in implant surgery and full mouth restorations.',
    image: 'https://i.pravatar.cc/300?u=john-smith',
    nfts: [
      {
        id: 9670134303586679285938824118598092069331462853430377829340775294811530559744n,
        title: 'ENS NFT',
        contractAddress: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
      },
    ],
    reviews: [
      {
        reviewer: 'Ali M.',
        rating: 5,
        text: 'Very kind and professional. I’m completely satisfied with the treatment!',
      },
      {
        reviewer: 'Nigar A.',
        rating: 4,
        text: 'Great results, but appointment was slightly delayed.',
      },
    ],
  },
];

// SEO metadata
export const metadata: Metadata = {
  title: 'Dentist Profile – Dentara',
  description: 'View verified dentist profiles on Dentara.',
};

// Static params
export async function generateStaticParams() {
  return dummyDentists.map((d) => ({ id: d.id }));
}

// Page Component
export default async function DentistProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const dentist = dummyDentists.find((d) => d.id === params.id);

  if (!dentist) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Dentist Header */}
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-40 h-40 relative rounded-full overflow-hidden border-4 border-[#00C897] shadow-lg">
          <Image
            src={dentist.image}
            alt={dentist.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#007B5E' }}>
            {dentist.name}
          </h1>
          <p className="text-lg font-semibold text-gray-600">{dentist.specialty}</p>
          <p className="mt-3 text-gray-700">{dentist.bio}</p>
        </div>
      </div>

      {/* NFT Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#007B5E' }}>
          Credential NFTs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dentist.nfts.map((nft) => (
            <NFTCard
              key={nft.id.toString()}
              id={nft.id}
              title={nft.title}
              contractAddress={nft.contractAddress}
            />
          ))}
        </div>
      </div>

      {/* Patient Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#007B5E' }}>
          Patient Reviews
        </h2>
        <ReviewList reviews={dentist.reviews || []} />
      </div>
    </div>
  );
}
