/**
 * SearchBar Component
 * A flexible search component with filters and suggestions
 * Supports real-time search, debouncing, and advanced filtering
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BaseCard } from '@/components/ui/base-card';

export interface SearchFilter {
  key: string;
  label: string;
  value: string | string[];
  type: 'select' | 'multiselect' | 'date' | 'daterange';
  options?: { value: string; label: string }[];
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type?: string;
  highlight?: string;
}

export interface SearchBarProps {
  // Basic search
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string, filters?: Record<string, any>) => void;
  
  // Placeholder and styling
  placeholder?: string;
  className?: string;
  
  // Debouncing
  debounceMs?: number;
  immediate?: boolean;
  
  // Filters
  filters?: SearchFilter[];
  onFiltersChange?: (filters: Record<string, any>) => void;
  
  // Suggestions
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  showSuggestions?: boolean;
  
  // Actions
  onClear?: () => void;
  loading?: boolean;
  disabled?: boolean;
  
  // Advanced options
  showAdvancedToggle?: boolean;
  advancedFilters?: React.ReactNode;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className,
  debounceMs = 300,
  immediate = false,
  filters = [],
  onFiltersChange,
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = true,
  onClear,
  loading = false,
  disabled = false,
  showAdvancedToggle = false,
  advancedFilters,
  ariaLabel,
  ariaDescribedBy
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value with internal state
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (immediate) {
      onSearch(inputValue, activeFilters);
    } else {
      debounceRef.current = setTimeout(() => {
        onSearch(inputValue, activeFilters);
      }, debounceMs);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, activeFilters, debounceMs, immediate, onSearch]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestionsDropdown(newValue.length > 0 && showSuggestions);
    setActiveSuggestion(-1);
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue, activeFilters);
    setShowSuggestionsDropdown(false);
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    onChange('');
    setActiveFilters({});
    onFiltersChange?.({});
    setShowSuggestionsDropdown(false);
    onClear?.();
    inputRef.current?.focus();
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setInputValue(suggestion.text);
    onChange(suggestion.text);
    setShowSuggestionsDropdown(false);
    onSuggestionSelect?.(suggestion);
    onSearch(suggestion.text, activeFilters);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Handle filter removal
  const handleFilterRemove = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestionsDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestion >= 0) {
          handleSuggestionSelect(suggestions[activeSuggestion]);
        } else {
          handleSubmit(e as any);
        }
        break;
      case 'Escape':
        setShowSuggestionsDropdown(false);
        setActiveSuggestion(-1);
        break;
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className={cn('w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search input */}
          <div className="relative flex items-center">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || loading}
              className="pr-20"
              aria-label={ariaLabel || 'Search'}
              aria-describedby={ariaDescribedBy}
              aria-expanded={showSuggestionsDropdown}
              aria-autocomplete="list"
              aria-activedescendant={
                activeSuggestion >= 0 ? `suggestion-${activeSuggestion}` : undefined
              }
            />
            
            {/* Action buttons */}
            <div className="absolute right-2 flex items-center gap-1">
              {loading && (
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
              )}
              
              {(inputValue || hasActiveFilters) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={disabled}
                  className="h-6 w-6 p-0"
                  aria-label="Clear search"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
              
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="h-6 w-6 p-0"
                aria-label="Search"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestionsDropdown && suggestions.length > 0 && (
            <BaseCard
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-y-auto"
              role="listbox"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  id={`suggestion-${index}`}
                  className={cn(
                    'px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800',
                    index === activeSuggestion && 'bg-gray-100 dark:bg-gray-800'
                  )}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  role="option"
                  aria-selected={index === activeSuggestion}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{suggestion.text}</span>
                    {suggestion.type && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    )}
                  </div>
                  {suggestion.highlight && (
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.highlight}
                    </div>
                  )}
                </div>
              ))}
            </BaseCard>
          )}
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(activeFilters).map(([key, value]) => {
              const filter = filters.find(f => f.key === key);
              if (!filter) return null;

              const displayValue = Array.isArray(value) ? value.join(', ') : value;
              
              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <span>{filter.label}: {displayValue}</span>
                  <button
                    type="button"
                    onClick={() => handleFilterRemove(key)}
                    className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* Advanced filters toggle */}
        {(filters.length > 0 || showAdvancedToggle) && (
          <div className="mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
              <svg
                className={cn('w-4 h-4 ml-1 transition-transform', showAdvanced && 'rotate-180')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>
        )}

        {/* Advanced filters */}
        {showAdvanced && (
          <BaseCard className="mt-2 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map(filter => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-sm font-medium">{filter.label}</label>
                  
                  {filter.type === 'select' && (
                    <select
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      {filter.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {filter.type === 'multiselect' && (
                    <select
                      multiple
                      value={activeFilters[filter.key] || []}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        handleFilterChange(filter.key, values);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {filter.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {filter.type === 'date' && (
                    <input
                      type="date"
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
            
            {advancedFilters && (
              <div className="mt-4 pt-4 border-t">
                {advancedFilters}
              </div>
            )}
          </BaseCard>
        )}
      </form>
    </div>
  );
}

export default SearchBar;