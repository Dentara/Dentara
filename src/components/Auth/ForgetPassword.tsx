"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Graphics from "@/components/Auth/Graphics";
import SlideOnReveal from "@/components/SlideOnReveal";
import { integrations, messages } from "../../../integrations.config";
import z from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

const ForgetPassword = () => {
  const [data, setData] = useState({
    email: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!integrations.isAuthEnabled) {
      toast.error(messages.auth);
      return;
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      result.error.errors.forEach((error) => {
        toast.error(error.message);
      });
      return;
    }

    try {
      const res = await axios.post("/api/forget-password/reset", data);

      if (res.status === 404) {
        toast.error("User not found.");
        return;
      }

      if (res.status === 200) {
        toast.success(res.data);
        setData({ email: "" });
      }

      setData({ email: "" });
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <section className="relative z-10 pt-[180px]">
      <div className="container">
        <div className="mx-[-16px] flex flex-wrap">
          <div className="w-full px-4">
            <SlideOnReveal delay={0.3}>
              <div
                className="wow fadeInUp dark:bg-dark mx-auto max-w-[500px] rounded-md border border-[#f5f5f5] bg-white p-12 sm:p-[60px] dark:border-0"
                data-wow-delay=".2s"
              >
                <h3 className="mb-3 text-center text-2xl font-bold text-black sm:text-3xl dark:text-white">
                  Forgot Password
                </h3>

                <p className="text-body-color mb-11 text-center text-base font-medium">
                  Enter the email address associated with your account and
                  we&#39;ll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-8">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      name="email"
                      value={data.email}
                      onChange={(e) =>
                        setData({ ...data, email: e.target.value })
                      }
                      className="shadow-one dark:shadow-signUp border-body-color/50 text-body-color placeholder-body-color focus:border-primary dark:border-body-color/30 w-full rounded-full border bg-transparent px-6 py-3 text-base outline-hidden focus-visible:shadow-none dark:bg-[#1F2656]"
                    />
                  </div>

                  <button className="hover:shadow-signUp bg-primary hover:bg-primary/80 flex w-full items-center justify-center rounded-full px-9 py-4 text-base font-medium text-white transition duration-300 ease-in-out">
                    Send Reset Link
                  </button>
                </form>
              </div>
            </SlideOnReveal>
          </div>
        </div>
      </div>

      <Graphics />
    </section>
  );
};

export default ForgetPassword;
