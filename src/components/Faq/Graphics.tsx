import React from "react";
import Image from "next/image";

const Graphics = () => {
  return (
    <>
      <div className="absolute -bottom-36 left-0 -z-10">
        <Image
          src="images/shapes/faq-shape-1.svg"
          alt="shape"
          width={206}
          height={637}
        />
      </div>
      <div className="absolute -top-36 right-0 -z-10">
        <Image
          src="images/shapes/faq-shape-2.svg"
          alt="shape"
          width={172}
          height={517}
        />
      </div>
    </>
  );
};

export default Graphics;
