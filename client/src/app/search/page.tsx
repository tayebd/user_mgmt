'use client';

import React, { useEffect, useState } from 'react';
import { useSearchItemsQuery } from '@/state/api';
import { debounce } from 'lodash';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import TaskCard from '@/components/TaskCard';
import UserCard from '@/components/UserCard';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults, isLoading, error } = useSearchItemsQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });

  const handleSearch = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, 300);

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch]);

  return (
    <div className="h-full p-4">
      <Header 
        name="Search" 
      />
      
      <div className="relative mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for projects, tasks, or team members..."
            className="w-full rounded-lg border border-gray-300 bg-white p-4 pl-12 shadow-2xs transition-all focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            onChange={handleSearch}
          />
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {searchTerm.length < 3 ? (
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          Type at least 3 characters to search
        </div>
      ) : isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="mt-8 text-center text-red-500">
          Error occurred while fetching search results
        </div>
      ) : !searchResults || 
          (!searchResults.projects?.length && 
           !searchResults.tasks?.length && 
           !searchResults.users?.length) ? (
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          No results found for &quot;{searchTerm}&quot;
        </div>
      ) : (
        <div className="space-y-8">
          {searchResults.projects && searchResults.projects.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold dark:text-white">Projects</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {searchResults.tasks && searchResults.tasks.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold dark:text-white">Tasks</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {searchResults.users && searchResults.users.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold dark:text-white">Team Members</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
