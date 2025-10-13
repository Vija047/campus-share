import { useState } from 'react';
import {
    Filter,
    Search,
    TrendingUp,
    Clock,
    Users,
    Hash,
    ChevronDown,
    X
} from 'lucide-react';

const CommunityFilters = ({
    filters,
    onFilterChange,
    onSearch,
    totalPosts = 0
}) => {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const categories = [
        { value: '', label: 'All Categories' },
        { value: 'general', label: 'General Discussion' },
        { value: 'academic', label: 'Academic Help' },
        { value: 'projects', label: 'Projects & Assignments' },
        { value: 'internships', label: 'Internships & Jobs' },
        { value: 'events', label: 'Campus Events' },
        { value: 'resources', label: 'Study Resources' },
        { value: 'announcements', label: 'Announcements' }
    ];

    const semesters = [
        { value: '', label: 'All Semesters' },
        { value: '1', label: '1st Semester' },
        { value: '2', label: '2nd Semester' },
        { value: '3', label: '3rd Semester' },
        { value: '4', label: '4th Semester' },
        { value: '5', label: '5th Semester' },
        { value: '6', label: '6th Semester' },
        { value: '7', label: '7th Semester' },
        { value: '8', label: '8th Semester' }
    ];

    const sortOptions = [
        { value: 'createdAt', label: 'Recent', icon: Clock },
        { value: 'votes', label: 'Popular', icon: TrendingUp },
        { value: 'replies', label: 'Most Discussed', icon: Users }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const handleFilterChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setSearchQuery('');
        onFilterChange({
            sort: 'createdAt',
            sortOrder: 'desc',
            category: '',
            semester: '',
            search: ''
        });
        onSearch('');
    };

    const activeFiltersCount = Object.values({
        category: filters.category,
        semester: filters.semester,
        search: filters.search
    }).filter(Boolean).length;

    return (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filter Posts</h3>
                    {activeFiltersCount > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {activeFiltersCount} active
                        </span>
                    )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                    {totalPosts} posts found
                </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-3 sm:mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                onSearch('');
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>
            </form>

            {/* Sort Options */}
            <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Sort by
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {sortOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = filters.sort === option.value;

                        return (
                            <button
                                key={option.value}
                                onClick={() => handleFilterChange('sort', option.value)}
                                className={`flex items-center justify-center space-x-2 p-2 sm:p-3 rounded-lg border transition-all ${isActive
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center justify-between w-full p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-3 sm:mb-4"
            >
                <span className="text-xs sm:text-sm font-medium text-gray-700">Advanced Filters</span>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''
                    }`} />
            </button>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            <Hash className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                            Category
                        </label>
                        <select
                            value={filters.category || ''}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Semester Filter */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Semester
                        </label>
                        <select
                            value={filters.semester || ''}
                            onChange={(e) => handleFilterChange('semester', e.target.value)}
                            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {semesters.map((semester) => (
                                <option key={semester.value} value={semester.value}>
                                    {semester.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
                <button
                    onClick={clearFilters}
                    className="w-full p-2 sm:p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm sm:text-base"
                >
                    Clear All Filters
                </button>
            )}

            {/* Filter Summary */}
            {activeFiltersCount > 0 && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                        {filters.category && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                Category: {categories.find(c => c.value === filters.category)?.label}
                            </span>
                        )}
                        {filters.semester && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                Semester: {semesters.find(s => s.value === filters.semester)?.label}
                            </span>
                        )}
                        {filters.search && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                Search: "{filters.search}"
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityFilters;