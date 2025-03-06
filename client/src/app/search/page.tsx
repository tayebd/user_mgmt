'use client';

import React, { useState } from 'react';
import { useApiStore } from '@/state/api';

const SearchPage = () => {
  const { searchResults } = useApiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [capability, setCapability] = useState('');
  const [rating, setRating] = useState('');

  const handleSearch = async () => {
    // await searchCompanies({ searchTerm, location, capability, rating });
  };

  return (
    <div className="p-4 ml-64">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Capability..."
          value={capability}
          onChange={(e) => setCapability(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rating..."
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded">
        Search
      </button>
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Search Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Company Name</th>
                <th className="py-2 px-4 text-left">Location</th>
                <th className="py-2 px-4 text-left">Capability</th>
                <th className="py-2 px-4 text-left">Rating</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.companies?.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4">{company.name}</td>
                  <td className="py-2 px-4">{company.location}</td>
                  <td className="py-2 px-4">{company.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
