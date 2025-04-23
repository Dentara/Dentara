import React from "react";
import Link from "next/link";
import Image from "next/image";
import FooterBottom from "@/components/Footer/FooterBottom";
import { FooterMenu } from "@/types/footerMenu";
import Graphics from "@/components/Footer/Graphics";

const footerNavData: FooterMenu[] = [
  {
    title: "Quick Links",
    navItems: [
      {
        label: "What is ico",
        route: "#",
      },
      {
        label: "Roadmap",
        route: "#",
      },
      {
        label: "Whitepaper",
        route: "#",
      },
      {
        label: "Social Network",
        route: "#",
      },
      {
        label: "Join Us Now",
        route: "#",
      },
    ],
  },
  {
    title: "Supports",
    navItems: [
      {
        label: "Setting & Privacy",
        route: "#",
      },
      {
        label: "Help & Support",
        route: "#",
      },
      {
        label: "Terms & Conditions",
        route: "#",
      },
      {
        label: "24/7 Supports",
        route: "#",
      },
      {
        label: "On Point FAQ",
        route: "#",
      },
    ],
  },
];

const Footer = () => {
  return (
    <>
      <footer className="relative z-10 pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-4/12">
              <div
                className="wow fadeInUp mb-14 max-w-[330px] xl:mb-20"
                data-wow-delay="0s"
              >
                <Link href="/" className="mb-6 inline-block">
                  <Image
                    width={176}
                    height={46}
                    src={"/images/logo/logo-white.svg"}
                    alt="Logo"
                    priority
                    className="hidden dark:block"
                  />
                  <Image
                    width={176}
                    height={46}
                    src={"/images/logo/logo.svg"}
                    alt="Logo"
                    priority
                    className="dark:hidden"
                  />
                </Link>

                <p className="mb-10 text-base font-medium text-body-color-2 dark:text-body-color">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
                  vitae quam nec ante fringilla vel at erat convallis elit.
                </p>
                <div className="flex items-center space-x-3">
                  <Link
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-light-bg text-body-color-2 hover:bg-primary hover:text-white dark:bg-dark dark:text-white dark:hover:bg-primary"
                    aria-label="social-link"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.25 8.46875C7.6875 8.46875 7.28125 8.96875 7.28125 9.53125C7.28125 10.0938 7.71875 10.5938 8.25 10.5938C8.8125 10.5938 9.21875 10.125 9.21875 9.53125C9.25 8.9375 8.8125 8.46875 8.25 8.46875Z"
                        fill="currentColor"
                      />
                      <path
                        d="M11.75 10.5625C12.285 10.5625 12.7187 10.0868 12.7187 9.5C12.7187 8.9132 12.285 8.4375 11.75 8.4375C11.215 8.4375 10.7812 8.9132 10.7812 9.5C10.7812 10.0868 11.215 10.5625 11.75 10.5625Z"
                        fill="currentColor"
                      />
                      <path
                        d="M16.4687 0.3125H3.53125C2.4375 0.3125 1.53125 1.1875 1.53125 2.28125V15.375C1.53125 16.4688 2.40625 17.3438 3.5 17.3438H14.4687L13.9375 15.5938L15.1562 16.75L16.3437 17.8437L18.4062 19.6875V2.28125C18.5 1.1875 17.5625 0.3125 16.4687 0.3125ZM12.7187 12.9375C12.7187 12.9375 12.375 12.5313 12.0625 12.1563C13.3437 11.8125 13.8125 11 13.8125 11C13.4062 11.25 13.0312 11.4375 12.7187 11.5625C12.25 11.7812 11.75 11.9062 11.3125 11.9687C10.375 12.1562 9.5625 12.0937 8.8125 11.9687C8.25 11.875 7.8125 11.7188 7.40625 11.5625C7.1875 11.4687 6.90625 11.375 6.6875 11.25C6.65625 11.25 6.65625 11.2188 6.59375 11.2188C6.59375 11.2188 6.5625 11.2187 6.5625 11.1875C6.375 11.0937 6.3125 11 6.3125 11C6.3125 11 6.8125 11.7813 8.03125 12.1563C7.71875 12.5 7.375 12.9375 7.375 12.9375C5.21875 12.8438 4.4375 11.5 4.4375 11.5C4.4375 8.375 5.84375 5.875 5.84375 5.875C7.25 4.8125 8.5625 4.875 8.5625 4.875L8.65625 5C6.875 5.46875 6.09375 6.25 6.09375 6.25C6.09375 6.25 6.3125 6.125 6.65625 6C7.71875 5.5625 8.5 5.4375 8.84375 5.375C8.875 5.375 8.9375 5.375 9.03125 5.375C9.59375 5.28125 10.3125 5.28125 10.9687 5.375C11.9062 5.46875 12.875 5.78125 13.875 6.3125C13.875 6.3125 13.125 5.59375 11.4375 5.09375L11.5625 4.90625C11.5625 4.90625 12.875 4.875 14.2812 5.90625C14.2812 5.90625 15.6875 8.40625 15.6875 11.5313C15.7187 11.5 14.875 12.9063 12.7187 12.9375Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-light-bg text-body-color-2 hover:bg-primary hover:text-white dark:bg-dark dark:text-white dark:hover:bg-primary"
                    aria-label="social-link"
                  >
                    <svg
                      width="18"
                      height="15"
                      viewBox="0 0 18 15"
                      className="fill-current"
                    >
                      <path d="M17.7165 2.00016C17.0749 2.29183 16.3832 2.4835 15.6665 2.57516C16.3999 2.1335 16.9665 1.4335 17.2332 0.591829C16.5415 1.0085 15.7749 1.30016 14.9665 1.46683C14.3082 0.750163 13.3832 0.333496 12.3332 0.333496C10.3749 0.333496 8.77487 1.9335 8.77487 3.9085C8.77487 4.19183 8.8082 4.46683 8.86654 4.72516C5.89987 4.57516 3.2582 3.15016 1.49987 0.991829C1.19154 1.51683 1.01654 2.1335 1.01654 2.7835C1.01654 4.02516 1.64154 5.12516 2.6082 5.75016C2.01654 5.75016 1.46654 5.5835 0.983203 5.3335C0.983203 5.3335 0.983203 5.3335 0.983203 5.3585C0.983203 7.09183 2.21654 8.54183 3.84987 8.86683C3.54987 8.95016 3.2332 8.99183 2.9082 8.99183C2.6832 8.99183 2.4582 8.96683 2.24154 8.92516C2.69154 10.3335 3.99987 11.3835 5.57487 11.4085C4.3582 12.3752 2.81654 12.9418 1.1332 12.9418C0.84987 12.9418 0.566536 12.9252 0.283203 12.8918C1.86654 13.9085 3.74987 14.5002 5.76654 14.5002C12.3332 14.5002 15.9415 9.05016 15.9415 4.32516C15.9415 4.16683 15.9415 4.01683 15.9332 3.8585C16.6332 3.3585 17.2332 2.72516 17.7165 2.00016Z" />
                    </svg>
                  </Link>
                  <Link
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-light-bg text-body-color-2 hover:bg-primary hover:text-white dark:bg-dark dark:text-white dark:hover:bg-primary"
                    aria-label="social-link"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      className="fill-current"
                    >
                      <path d="M13.8333 0.5C14.2754 0.5 14.6993 0.675595 15.0118 0.988155C15.3244 1.30072 15.5 1.72464 15.5 2.16667V13.8333C15.5 14.2754 15.3244 14.6993 15.0118 15.0118C14.6993 15.3244 14.2754 15.5 13.8333 15.5H2.16667C1.72464 15.5 1.30072 15.3244 0.988155 15.0118C0.675595 14.6993 0.5 14.2754 0.5 13.8333V2.16667C0.5 1.72464 0.675595 1.30072 0.988155 0.988155C1.30072 0.675595 1.72464 0.5 2.16667 0.5H13.8333ZM13.4167 13.4167V9C13.4167 8.27949 13.1304 7.5885 12.621 7.07903C12.1115 6.56955 11.4205 6.28333 10.7 6.28333C9.99167 6.28333 9.16667 6.71667 8.76667 7.36667V6.44167H6.44167V13.4167H8.76667V9.30833C8.76667 8.66667 9.28333 8.14167 9.925 8.14167C10.2344 8.14167 10.5312 8.26458 10.75 8.48338C10.9688 8.70217 11.0917 8.99891 11.0917 9.30833V13.4167H13.4167ZM3.73333 5.13333C4.10464 5.13333 4.46073 4.98583 4.72328 4.72328C4.98583 4.46073 5.13333 4.10464 5.13333 3.73333C5.13333 2.95833 4.50833 2.325 3.73333 2.325C3.35982 2.325 3.0016 2.47338 2.73749 2.73749C2.47338 3.0016 2.325 3.35982 2.325 3.73333C2.325 4.50833 2.95833 5.13333 3.73333 5.13333ZM4.89167 13.4167V6.44167H2.58333V13.4167H4.89167Z" />
                    </svg>
                  </Link>
                  <Link
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-light-bg text-body-color-2 hover:bg-primary hover:text-white dark:bg-dark dark:text-white dark:hover:bg-primary"
                    aria-label="social-link"
                  >
                    <svg
                      width="18"
                      height="12"
                      viewBox="0 0 18 12"
                      className="fill-current"
                    >
                      <path d="M7.33366 8.49984L11.6587 5.99984L7.33366 3.49984V8.49984ZM16.967 1.97484C17.0753 2.3665 17.1503 2.8915 17.2003 3.55817C17.2587 4.22484 17.2837 4.79984 17.2837 5.29984L17.3337 5.99984C17.3337 7.82484 17.2003 9.1665 16.967 10.0248C16.7587 10.7748 16.2753 11.2582 15.5253 11.4665C15.1337 11.5748 14.417 11.6498 13.317 11.6998C12.2337 11.7582 11.242 11.7832 10.3253 11.7832L9.00033 11.8332C5.50866 11.8332 3.33366 11.6998 2.47533 11.4665C1.72533 11.2582 1.24199 10.7748 1.03366 10.0248C0.925326 9.63317 0.850326 9.10817 0.800326 8.44151C0.741992 7.77484 0.716992 7.19984 0.716992 6.69984L0.666992 5.99984C0.666992 4.17484 0.800326 2.83317 1.03366 1.97484C1.24199 1.22484 1.72533 0.741504 2.47533 0.533171C2.86699 0.424837 3.58366 0.349837 4.68366 0.299837C5.76699 0.241504 6.75866 0.216504 7.67533 0.216504L9.00033 0.166504C12.492 0.166504 14.667 0.299837 15.5253 0.533171C16.2753 0.741504 16.7587 1.22484 16.967 1.97484Z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {footerNavData.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-4/12 xl:w-2/12"
              >
                <div className="mb-14 xl:mb-20">
                  <h4 className="mb-5 text-2xl font-bold text-black dark:text-white">
                    {group.title}
                  </h4>

                  <div className="space-y-3">
                    {group.navItems &&
                      group.navItems.map((item, index) => (
                        <Link
                          key={index}
                          href={item.route}
                          className="block text-base font-medium text-body-color-2 hover:text-primary dark:text-body-color dark:hover:text-primary"
                        >
                          {item.label}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="w-full px-4 md:w-1/2 lg:w-1/2 xl:w-4/12">
            </div>
          </div>

          <FooterBottom />
        </div>
        <Graphics />
      </footer>
    </>
  );
};

export default Footer;
