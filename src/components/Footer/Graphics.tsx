import React from "react";
import Image from "next/image";

const Graphics = () => {
  return (
    <>
      <div className="absolute left-0 top-0 -z-10">
        <Image
          width={158}
          height={392}
          src="/images/shapes/footer-shape-2.svg"
          alt="shape"
        />
      </div>

      <div className="absolute bottom-0 right-0 -z-10">
        <Image
          width={187}
          height={254}
          src="/images/shapes/footer-shape-1.svg"
          alt="shape"
        />
      </div>
    </>
  );
};

export default Graphics;
