import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

/**
 * FilterPanel Component
 * Multi-select filters with date range picker
 */
const FilterPanel = ({ filters, onApply, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});

  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters(prev => {
      const current = prev[filterKey] || [];
      const isSelected = current.includes(value);
      
      return {
        ...prev,
        [filterKey]: isSelected
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  const handleDateChange = (dateKey, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [dateKey]: value
    }));
  };

  const handleApply = () => {
    onApply(selectedFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedFilters({});
    onReset();
    setIsOpen(false);
  };

  const activeFilterCount = Object.values(selectedFilters).filter(v => 
    Array.isArray(v) ? v.length > 0 : v
  ).length;

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="h-5 w-5" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Panel Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filter Options */}
              <div className="space-y-4">
                {filters.map((filter) => (
                  <div key={filter.key} className="border-b border-gray-200 pb-4 last:border-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {filter.label}
                    </label>

                    {filter.type === 'select' && (
                      <div className="space-y-2">
                        {filter.options.map((option) => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={(selectedFilters[filter.key] || []).includes(option.value)}
                              onChange={() => handleFilterChange(filter.key, option.value)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {filter.type === 'date' && (
                      <input
                        type="date"
                        value={selectedFilters[filter.key] || ''}
                        onChange={(e) => handleDateChange(filter.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}

                    {filter.type === 'dateRange' && (
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={selectedFilters[`${filter.key}Start`] || ''}
                          onChange={(e) => handleDateChange(`${filter.key}Start`, e.target.value)}
                          placeholder="Start Date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="date"
                          value={selectedFilters[`${filter.key}End`] || ''}
                          onChange={(e) => handleDateChange(`${filter.key}End`, e.target.value)}
                          placeholder="End Date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;
