import React from "react";
import Image from "next/image";

const DownloadImages = () => {
  return (
    <>
      <div
        className="wow fadeInUp relative -z-10 text-center"
        data-wow-delay="0s"
      >
        <Image
          src="/images/download/app-image.png"
          alt="app image"
          className="mx-auto hidden text-center dark:block"
          width={504}
          height={546}
        />
        <Image
          src="/images/download/app-image-2.png"
          alt="app image"
          className="mx-auto dark:hidden"
          width={504}
          height={546}
        />

        <span
          className="absolute bottom-0 right-0 -z-10 h-[320px] w-[320px] rounded-full"
          style={{
            background:
              "linear - gradient(180deg, rgba(55, 109, 249, 0) 0%, rgba(255, 96, 166, 0.32) 100%)",
            filter: "blur(100px)",
          }}
        ></span>
      </div>
    </>
  );
};

export default DownloadImages;
