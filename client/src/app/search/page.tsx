'use client';

import React, { useState } from 'react';
import { useApiStore } from '@/state/api';

const SearchPage = () => {
  const { searchResults, searchItems } = useApiStore();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    await searchItems(searchTerm);
  };

  return (
    <div>
      <h1>Search</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        <h2>Search Results</h2>
        <ul>
          {searchResults.users?.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchPage;
