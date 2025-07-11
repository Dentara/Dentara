"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';

const dummyDentists = [
  {
    id: 'jane-doe',
    name: 'Dr. Jane Doe',
    specialty: 'Orthodontist',
    image: 'https://i.pravatar.cc/300?u=jane-doe',
  },
  {
    id: 'john-smith',
    name: 'Dr. John Smith',
    specialty: 'Implantologist',
    image: 'https://i.pravatar.cc/300?u=john-smith',
  },
];

export default function DentistDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const filteredDentists = useMemo(() => {
    return dummyDentists.filter((dentist) => {
      const matchesSearch =
        dentist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dentist.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === '' || dentist.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Başlıq */}
      <h1
        className="text-3xl font-bold text-center mb-10"
        style={{ color: '#007B5E' }}
      >
        Browse Verified Dentists
      </h1>

      {/* Search + Filter + Clear */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search dentists by name or specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 p-2 rounded border focus:outline-none focus:ring-2 focus:ring-[#00C897]"
        />

        {/* Specialty Filter */}
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="w-full md:w-1/4 p-2 rounded border focus:outline-none focus:ring-2 focus:ring-[#00C897]"
        >
          <option value="">All Specialties</option>
          <option value="Orthodontist">Orthodontist</option>
          <option value="Implantologist">Implantologist</option>
        </select>

        {/* Clear Filters Button */}
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedSpecialty('');
          }}
          className="px-4 py-2 rounded border border-[#00C897] text-[#00C897] bg-white hover:bg-[#00C897] hover:text-white transition"
        >
          Clear Filters
        </button>
      </div>

      {/* Dentist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {filteredDentists.map((dentist) => (
          <Link
            key={dentist.id}
            href={`/dentists/${dentist.id}`}
            className="block rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition bg-white overflow-hidden"
          >
            <div className="relative w-full h-48">
              <Image
                src={dentist.image}
                alt={dentist.name}
                fill
                className="object-cover rounded-t-xl"
              />
            </div>
            <div className="p-6 text-center">
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: '#007B5E' }}
              >
                {dentist.name}
              </h2>
              <p className="text-gray-600">{dentist.specialty}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
