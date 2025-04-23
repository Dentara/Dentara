import React from "react";
import Image from "next/image";

const Graphics = () => {
  return (
    <>
      <div className="absolute bottom-0 left-0 -z-10">
        <Image
          width={435}
          height={959}
          src="images/shapes/timeline.svg"
          alt="shape"
        />
      </div>
    </>
  );
};

export default Graphics;
