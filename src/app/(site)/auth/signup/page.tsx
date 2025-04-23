import Signup from "@/components/Auth/Signup";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";

export const metadata: Metadata = {
  title:
    "Sign Up Page | Crypto - Next.js Template",
  description: "This is Sign Up page for Crypto Next.js Template",
  // other metadata
};

export default function Register() {
  return (
    <>
      <DefaultLayout>
        <Signup />
      </DefaultLayout>
    </>
  );
}
