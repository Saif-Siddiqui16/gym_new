export const paginateData = (data, page, limit) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
        total: data.length,
        data: data.slice(start, end),
        totalPages: Math.ceil(data.length / limit),
        currentPage: page
    };
};
