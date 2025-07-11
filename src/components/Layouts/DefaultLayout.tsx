import React from "react";
import Header from "@/components/Header";
import ToasterContext from "@/app/context/ToastContext";
import Footer from "@/components/Footer/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const DefaultLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <div className="isolate">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
      <ToasterContext />
      <ScrollToTop />
    </>
  );
};

export default DefaultLayout;
