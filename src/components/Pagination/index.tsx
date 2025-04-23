"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface PaginationProps {
  totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  const MAX_VISIBLE_PAGES = 5;

  useEffect(() => {
    const updatePages = () => {
      if (currentPage < 1) {
        setCurrentPage(1);
      } else if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    };

    const startPage = Math.max(
      1,
      currentPage - Math.floor(MAX_VISIBLE_PAGES / 2),
    );
    const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

    setVisiblePages(
      Array.from({ length: endPage - startPage + 1 }, (_, i) => i + startPage),
    );

    updatePages();
  }, [currentPage, totalPages]);

  const navigatePage = (direction: number) => {
    setCurrentPage((prevPage) => prevPage + direction);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const showEllipsisBeforeLastPage =
    totalPages > MAX_VISIBLE_PAGES &&
    currentPage <= totalPages - MAX_VISIBLE_PAGES + 2;

  return (
    <>
      <div className="mx-[-16px] flex flex-wrap">
        <div className="w-full px-4">
          <ul
            className="wow fadeInUp flex items-center justify-center pt-8"
            data-wow-delay="0s"
          >
            <li className="mx-1">
              <Link
                href="#"
                onClick={() => navigatePage(-1)}
                className="bg-body-color/25 text-body-color-2 hover:bg-primary dark:bg-dark dark:text-body-color dark:hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white dark:hover:text-white"
              >
                Prev
              </Link>
            </li>

            {visiblePages.map((page) => (
              <li key={page} className="mx-1">
                <Link
                  href="#"
                  onClick={() => goToPage(page)}
                  className="bg-body-color/25 text-body-color-2 hover:bg-primary dark:bg-dark dark:text-body-color dark:hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white dark:hover:text-white"
                >
                  {page}
                </Link>
              </li>
            ))}

            {showEllipsisBeforeLastPage && (
              <li className="mx-1">
                <Link
                  href="#"
                  className="bg-body-color/25 text-body-color dark:bg-dark flex h-9 min-w-[36px] cursor-not-allowed items-center justify-center rounded-md px-4 text-sm"
                >
                  ...
                </Link>
              </li>
            )}

            <li className="mx-1">
              <Link
                onClick={() => goToPage(totalPages)}
                href="#"
                className="bg-body-color/25 text-body-color-2 hover:bg-primary dark:bg-dark dark:text-body-color dark:hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white dark:hover:text-white"
              >
                {totalPages}
              </Link>
            </li>

            <li className="mx-1">
              <Link
                href="#"
                onClick={() => navigatePage(1)}
                className="bg-body-color/25 text-body-color-2 hover:bg-primary dark:bg-dark dark:text-body-color dark:hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white dark:hover:text-white"
              >
                Next
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
