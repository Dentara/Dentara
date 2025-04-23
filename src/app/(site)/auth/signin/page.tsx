import Signin from "@/components/Auth/Signin";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";

export const metadata: Metadata = {
  title:
    "Login Page | Crypto - Next.js Template",
  description: "This is Login page for Crypto Next.js Template",
  // other metadata
};

const SigninPage = () => {
  return (
    <>
      <DefaultLayout>
        <Signin />
      </DefaultLayout>
    </>
  );
};

export default SigninPage;
