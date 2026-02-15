import { useEffect, useState } from "react";

interface UsePaginatedCollectionOptions {
    initialPage?: number;
}

interface UsePaginatedCollectionResult<T> {
    items: T[];
    totalItems: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    currentPageItems: T[];
    goToPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
}

export function usePaginatedCollection<T>(
    items: T[],
    pageSize: number,
    options?: UsePaginatedCollectionOptions
): UsePaginatedCollectionResult<T> {
    const normalizedPageSize = Math.max(1, Math.floor(pageSize));
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedPageSize));
    const initialPage = Math.max(1, Math.floor(options?.initialPage ?? 1));

    const [currentPage, setCurrentPage] = useState<number>(initialPage);

    useEffect(() => {
        setCurrentPage((prevPage) => Math.min(Math.max(prevPage, 1), totalPages));
    }, [totalPages]);

    const startIndex = (currentPage - 1) * normalizedPageSize;
    const endIndex = startIndex + normalizedPageSize;
    const currentPageItems = items.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (!Number.isInteger(page) || page < 1 || page > totalPages) {
            throw new Error("Invalid page number");
        }

        setCurrentPage(page);
    };

    const nextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const previousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    return {
        items,
        totalItems,
        pageSize: normalizedPageSize,
        currentPage,
        totalPages,
        currentPageItems,
        goToPage,
        nextPage,
        previousPage,
    };
}
