import React from "react";
import Link from "next/link";

const Breadcrumb = ({ pageName }: any) => {
  return (
    <>
      <section className="pb-24 pt-[140px]">
        <div className="container">
          <div
            className="wow fadeInUp rounded-lg bg-light-bg px-6 py-5 dark:bg-dark sm:px-8"
            data-wow-delay="0s"
          >
            <div className="-mx-4 flex flex-wrap">
              <div className="w-full px-4 sm:w-1/2">
                <h1 className="mb-4 text-xl font-bold text-black dark:text-white sm:mb-0">
                  {pageName}
                </h1>
              </div>

              <div className="w-full px-4 sm:w-1/2">
                <ul className="flex items-center sm:justify-end">
                  <li className="text-base font-medium text-black dark:text-white">
                    <Link href="/" className="hover:text-primary">
                      Home
                    </Link>
                    <span className="px-[10px]"> / </span>
                  </li>
                  <li className="text-base font-medium text-black dark:text-white">
                    {pageName}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Breadcrumb;
