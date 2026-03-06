export const filterData = (data, filters) => {
    if (!filters || Object.keys(filters).length === 0) return data;

    return data.filter(item => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key];
            if (filterValue === undefined || filterValue === null || filterValue === '' || filterValue === 'All') return true;

            const val = item[key];
            const filterValStr = filterValue.toString().toLowerCase();

            if (key === 'search') {
                return Object.values(item).some(v =>
                    v && v.toString().toLowerCase().includes(filterValStr)
                );
            }

            if (key === 'timeRange') {
                if (!item.date) return false;
                const d = item.date; // Format is YYYY-MM-DD
                const today = '2026-02-04'; // Mock "today"

                if (filterValue === 'Current Month') return d.startsWith('2026-02');
                if (filterValue === 'Last Month') return d.startsWith('2026-01');
                return true;
            }

            if (val === undefined || val === null) return false;
            return val.toString().toLowerCase() === filterValStr;
        });
    });
};
