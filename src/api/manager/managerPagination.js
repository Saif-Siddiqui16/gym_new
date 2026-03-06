
export const paginateData = (data, page, limit) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return {
        data: data.slice(startIndex, endIndex),
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit)
    };
};
