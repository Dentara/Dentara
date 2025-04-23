"use client";

import React from "react";
import SlideOnReveal from "@/components/SlideOnReveal";
import Graphics from "@/components/HeroArea/Graphics";
import HeroContent from "@/components/HeroArea/HeroContent";

const HeroArea = () => {
  return (
    <>
      <section id="home" className="relative z-10 pb-28 pt-48">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <SlideOnReveal delay={0.3}>
                <HeroContent />
              </SlideOnReveal>
            </div>
          </div>
        </div>

        <Graphics />
      </section>
    </>
  );
};

export default HeroArea;
