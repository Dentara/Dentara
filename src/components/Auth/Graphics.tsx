import React from "react";
import Image from "next/image";

const Graphics = () => {
  return (
    <>
      <div
        className="absolute left-0 top-0 -z-10 h-full w-full opacity-20"
        style={{
          backgroundImage:
            "linear-gradient( 180deg, #3e7dff 0%, rgba(62, 125, 255, 0) 100%)",
        }}
      ></div>
      <Image
        src="/images/shapes/hero-shape-1.svg"
        alt="shape"
        className="absolute left-0 top-0 -z-10"
        width={411}
        height={276}
      />
      <Image
        src="/images/shapes/hero-shape-2.svg"
        alt="shape"
        className="absolute right-0 top-0 -z-10"
        width={820}
        height={692}
      />
    </>
  );
};

export default Graphics;
