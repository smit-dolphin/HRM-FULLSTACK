export function paginationHelper(req, totalData, itemPerPage) {
    const limit = Math.max(1, Number(req.query.limit) || 10)
    const currentPage = Math.max(1, Number(req.query.page) || 1)

    return {
        limit,
        currentPage,
        skip: (currentPage - 1) * limit,
        meta: {
            totalData,
            totalPages: Math.ceil(totalData / limit),
            currentPage,
            itemPerPage
        }
    }
}