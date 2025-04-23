import React from "react";
import Image from "next/image";

const Graphics = () => {
  return (
    <>
      <div className="absolute -top-32 right-0 -z-10">
        <Image
          width={311}
          height={768}
          src="/images/shapes/token-sale-shape.svg"
          alt="shape"
        />
      </div>
    </>
  );
};

export default Graphics;
