"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    // Button is displayed after scrolling for 300 pixels
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="hover:shadow-signUp back-to-top bg-primary fixed right-8 bottom-8 flex size-10 items-center justify-center rounded-lg text-white shadow-md transition"
    >
      <span className="sr-only">Scroll To Top</span>
      <span className="mt-[6px] h-3 w-3 rotate-45 border-t border-l border-white"></span>
    </button>
  );
}
