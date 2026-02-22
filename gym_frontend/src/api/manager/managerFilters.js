
export const filterData = (data, filters) => {
    if (!filters || Object.keys(filters).length === 0) return data;

    // Extract 'search' from the other specific filters
    const { search, ...otherFilters } = filters;

    return data.filter(item => {
        // 1. Check specific filters (e.g., status, priority)
        const matchesFilters = Object.keys(otherFilters).every(key => {
            if (!otherFilters[key] || otherFilters[key] === 'All') return true; // Skip empty or "All" filters

            // Special handling for dateRange
            if (key === 'dateRange') {
                if (!item.date) return false;
                const d = item.date; // Format is YYYY-MM-DD
                const today = '2024-03-15'; // Mock "today" for consistency with mock data

                if (otherFilters[key] === 'Today') return d === today;
                if (otherFilters[key] === 'Yesterday') return d === '2024-03-14';
                // For "This Week" and "This Month", simplified match for mock data
                if (otherFilters[key] === 'This Week' || otherFilters[key] === 'This Month') return d.startsWith('2024-03');
                return true;
            }

            if (item[key] === undefined) return false; // Fail if key doesn't exist on item

            // Partial match for strings, exact match for others
            if (typeof item[key] === 'string') {
                return item[key].toLowerCase().includes(otherFilters[key].toLowerCase());
            }
            return item[key] === otherFilters[key];
        });

        if (!matchesFilters) return false;

        // 2. Check global search (if present)
        if (search) {
            const lowerSearch = search.toLowerCase();
            // Check if ANY of the object's values match the search term
            return Object.values(item).some(val =>
                (typeof val === 'string' || typeof val === 'number') &&
                String(val).toLowerCase().includes(lowerSearch)
            );
        }

        return true;
    });
};
