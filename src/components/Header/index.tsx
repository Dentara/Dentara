"use client";

import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu } from "@/types/menu";
import { onScroll } from "@/utils/scrollActive";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DarkModeSwitcher from "@/components/Header/DarkModeSwitcher";
import GlobalSearchModal from "@/components/GlobalSearch";

const menuData: Menu[] = [
  {
    label: "Home",
    route: "/#home",
  },
  {
    label: "Features",
    route: "/#features",
  },
  {
    label: "Roadmap",
    route: "/#roadmap",
  },
  {
    label: "Pages",
    route: "#",
    children: [
      {
        label: "Sign In",
        route: "/signin",
      },
      {
        label: "Sign Up",
        route: "/signup",
      },
    ],
  },
  {
    label: "Support",
    route: "/#contact",
  },
];


const Header = () => {
  useEffect(() => {
    if (window.location.pathname === "/") {
      window.addEventListener("scroll", onScroll);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const { data: session } = useSession();

  const pathUrl = usePathname();
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
  });

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const closeMenu = () => {
    setNavbarOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 z-50 flex w-full items-center ${
          sticky
            ? "shadow-sticky dark:bg-dark/80 bg-white/80 backdrop-blur-xs"
            : "bg-transparent dark:bg-transparent"
        }`}
      >
        <div className="container max-w-[1430px]">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4">
              <Link
                href="/"
                className={`block w-full ${sticky ? "py-4 lg:py-2" : "py-6 lg:py-5"}`}
              >
                <Image
                  width={176}
                  height={46}
                  src={"/images/logo/logo.svg"}
                  alt="Logo"
                  priority
                  className="block w-full dark:hidden"
                />
                <Image
                  width={176}
                  height={46}
                  src={"/images/logo/logo-white.svg"}
                  alt="Logo"
                  priority
                  className="hidden w-full dark:block"
                />
              </Link>
            </div>

            <div className="flex w-full items-center justify-end px-4">
              <div>
                <button
                  onClick={navbarToggleHandler}
                  className="ring-primary absolute top-1/2 right-4 block -translate-y-1/2 rounded-lg px-3 py-[6px] focus:ring-2 xl:hidden"
                  aria-label="navbarOpen"
                  name="navbarOpen"
                >
                  <span
                    className={`${navbarOpen && "top-[7px] rotate-45"} relative my-[6px] block h-[2px] w-[30px] bg-black dark:bg-white`}
                  ></span>
                  <span
                    className={`${navbarOpen && "opacity-0"} relative my-[6px] block h-[2px] w-[30px] bg-black dark:bg-white`}
                  ></span>
                  <span
                    className={`${navbarOpen && "top-[-8px] rotate-[135deg]"} relative my-[6px] block h-[2px] w-[30px] bg-black dark:bg-white`}
                  ></span>
                </button>

                <nav
                  className={`${!navbarOpen && "hidden"} absolute top-full right-4 w-full max-w-[250px] rounded-lg bg-white px-6 py-4 shadow-sm xl:static xl:block xl:w-full xl:max-w-full xl:bg-transparent xl:py-0 xl:shadow-none dark:bg-black dark:xl:bg-transparent`}
                >
                  <ul className="block xl:flex">
                    {menuData.map((item, index) =>
                      item.children ? (
                        <li key={index} className="submenu-item group relative">
                          <Link
                            onClick={() => handleSubmenu(index)}
                            href={item.route}
                            className="text-body-color-2 group-hover:text-primary dark:text-body-color relative flex items-center py-2 text-lg font-semibold lg:ml-7 lg:inline-flex lg:py-5 lg:pr-4 lg:pl-0 xl:ml-10 2xl:ml-12 dark:group-hover:text-white"
                          >
                            {item.label}
                            <span className="pl-3">
                              <svg
                                width="14"
                                height="8"
                                viewBox="0 0 14 8"
                                className={`fill-current ${openIndex === index ? "rotate-180 lg:rotate-0" : ""}`}
                              >
                                <path d="M6.54564 5.09128L11.6369 0L13.0913 1.45436L6.54564 8L0 1.45436L1.45436 0L6.54564 5.09128Z" />
                              </svg>
                            </span>
                          </Link>

                          <ul
                            className={`${openIndex === index ? "block" : "hidden lg:block"} submenu relative top-full left-0 rounded-lg bg-white transition-[top] duration-300 group-hover:opacity-100 lg:invisible lg:absolute lg:top-[115%] lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full dark:bg-black`}
                          >
                            {item.children.map((childItem, childIndex) => (
                              <li key={childIndex}>
                                <Link
                                  href={childItem.route}
                                  onClick={closeMenu}
                                  className="hover:text-primary dark:hover:text-primary block rounded-sm py-[10px] text-sm text-black lg:px-4 dark:text-white"
                                >
                                  {childItem.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ) : (
                        <li key={index} className="menu-item">
                          <Link
                            href={item.route}
                            onClick={closeMenu}
                            className="ud-menu-scroll text-body-color-2 hover:text-primary dark:text-body-color flex py-2 text-lg font-semibold lg:ml-7 lg:inline-flex lg:py-5 xl:ml-10 2xl:ml-12 dark:hover:text-white"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </nav>
              </div>

              <div className="flex items-center justify-end pr-16 xl:pr-0 xl:pl-12 2xl:pl-20">
                <button
                  onClick={() => setSearchModalOpen(true)}
                  className="mr-4 hidden h-[38px] w-[38px] items-center justify-center rounded-full bg-white text-black sm:flex dark:bg-black dark:text-white"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 18 18"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_369_1884)">
                      <path
                        d="M16.9347 15.3963L12.4816 11.7799C14.3168 9.26991 14.1279 5.68042 11.8338 3.41337C10.6194 2.19889 9.00003 1.52417 7.27276 1.52417C5.54549 1.52417 3.92617 2.19889 2.71168 3.41337C0.201738 5.92332 0.201738 10.0256 2.71168 12.5355C3.92617 13.75 5.54549 14.4247 7.27276 14.4247C8.91907 14.4247 10.4574 13.804 11.6719 12.6975L16.179 16.3409C16.287 16.4219 16.4219 16.4759 16.5569 16.4759C16.7458 16.4759 16.9077 16.3949 17.0157 16.26C17.2316 15.9901 17.2046 15.6122 16.9347 15.3963ZM7.27276 13.2102C5.86935 13.2102 4.5739 12.6705 3.57532 11.6719C1.52418 9.62076 1.52418 6.30116 3.57532 4.27701C4.5739 3.27843 5.86935 2.73866 7.27276 2.73866C8.67617 2.73866 9.97162 3.27843 10.9702 4.27701C13.0213 6.32815 13.0213 9.64775 10.9702 11.6719C9.99861 12.6705 8.67617 13.2102 7.27276 13.2102Z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_369_1884">
                        <rect
                          width="17.2727"
                          height="17.2727"
                          fill="white"
                          transform="translate(0.363647 0.363647)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </button>

                <DarkModeSwitcher />

                <div className="hidden sm:flex">
                  {session ? (
                    <div className="hidden items-center sm:flex">
                      <p className="mx-3 text-black dark:text-white">
                        {session?.user?.name}
                      </p>
                      <button
                        aria-label="SignOut"
                        onClick={() => signOut()}
                        className="border-body-color-2 text-body-color-2 hover:border-primary hover:bg-primary dark:hover:text-primary flex items-center justify-center rounded-full border px-8 py-[9px] text-base font-semibold transition-all hover:text-white lg:px-4 xl:px-8 dark:border-white dark:text-white dark:hover:bg-white"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        className="border-body-color-2 text-body-color-2 hover:border-primary hover:bg-primary dark:hover:text-primary flex items-center justify-center rounded-full border px-8 py-[9px] text-base font-semibold transition-all hover:text-white lg:px-4 xl:px-8 dark:border-white dark:text-white dark:hover:bg-white"
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <GlobalSearchModal
        searchModalOpen={searchModalOpen}
        setSearchModalOpen={setSearchModalOpen}
      />
    </>
  );
};

export default Header;
