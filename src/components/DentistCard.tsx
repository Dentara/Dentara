'use client';

import Image from 'next/image';
import Link from 'next/link';

type DentistCardProps = {
  id: string;
  name: string;
  specialty: string;
  image: string;
};

export default function DentistCard({ id, name, specialty, image }: DentistCardProps) {
  return (
    <Link href={`/dentists/${id}`} className="block bg-white rounded-lg shadow hover:shadow-md transition p-4 text-center">
      <div className="w-24 h-24 mx-auto relative rounded-full overflow-hidden border mb-4">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-500">{specialty}</p>
    </Link>
  );
}
