import React from 'react';
import { RiSearchLine, RiFilterLine } from 'react-icons/ri';
import './SearchFilterBar.scss';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  className?: string;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  className = ''
}) => {
  return (
    <div className={`search-filter-bar ${className}`}>
      <div className="search-box">
        <RiSearchLine className="search-icon" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {filters.length > 0 && (
        <div className="filters-container">
          {filters.map((filter) => (
            <div key={filter.id} className="filter-box">
              <RiFilterLine className="filter-icon" />
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
              >
                <option value="all">{filter.placeholder}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar; 