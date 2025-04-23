"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import SlideOnReveal from "@/components/SlideOnReveal";
import { integrations, messages } from "../../../integrations.config";
import z from "zod";

const schema = z.object({
  password: z
    .string()
    .min(8)
    .refine(
      (val) =>
        /[A-Z]/.test(val) && // At least one uppercase letter
        /[a-z]/.test(val) && // At least one lowercase letter
        /\d/.test(val) && // At least one number
        /[@$!%*?&]/.test(val), // At least one special character
      {
        message:
          "Password must be at least 8 characters long and contain uppercase and lowercase letters, a number, and a special character.",
      },
    ),
});

const ResetPassword = ({ token }: { token: string }) => {
  const [data, setData] = useState({
    password: "",
  });
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [user, setUser] = useState({
    email: "",
  });

  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.post(`/api/forget-password/verify-token`, {
          token,
        });

        if (res.status === 200) {
          setUser({
            email: res.data.email,
          });
          setVerified(true);
        }
      } catch (error) {
        // @ts-ignore
        toast.error(error.response.data);
        router.push("/auth/forget-password");
      }
    };

    if (integrations.isAuthEnabled) {
      verifyToken();
    }
  }, [token, router]);

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
      const res = await axios.post(`/api/forget-password/update`, {
        email: user?.email,
        password: data.password,
      });

      if (res.status === 200) {
        toast.success(res.data);
        setVerified(true);
        setData({ password: "" });
        router.push("/auth/signin");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <>
      {/* <!-- ===== SignIn Form Start ===== --> */}
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
                    Update Password
                  </h3>

                  <p className="text-body-color mb-11 text-center text-base font-medium">
                    Enter your new password
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-8">
                      <label
                        htmlFor="password"
                        className="text-dark mb-3 block text-sm font-medium dark:text-white"
                      >
                        Your Password
                      </label>
                      <input
                        type="text"
                        placeholder="Password"
                        name="password"
                        value={data.password}
                        onChange={(e) =>
                          setData({ ...data, password: e.target.value })
                        }
                        required
                        className={`shadow-one dark:shadow-signUp border-body-color/50 text-body-color placeholder-body-color focus:border-primary dark:border-body-color/30 w-full rounded-full border bg-transparent px-6 py-3 text-base outline-hidden focus-visible:shadow-none dark:bg-[#1F2656]`}
                      />
                    </div>

                    <button
                      aria-label="login with email and password"
                      className={`hover:shadow-signUp bg-primary hover:bg-primary/80 flex w-full items-center justify-center rounded-full px-9 py-4 text-base font-medium text-white transition duration-300 ease-in-out ${
                        error.length > 0 || !data.password
                          ? "bg-gray-600"
                          : "bg-black"
                      }`}
                      type="submit"
                    >
                      Save Password
                      <svg
                        className="fill-white"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z"
                          fill=""
                        />
                      </svg>
                    </button>

                    {error.length > 0 && (
                      <p className="text-red-500">{error}</p>
                    )}
                  </form>
                </div>
              </SlideOnReveal>
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ===== SignIn Form End ===== --> */}
    </>
  );
};

export default ResetPassword;
