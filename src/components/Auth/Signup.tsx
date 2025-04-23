"use client";
import axios from "axios";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import validateEmail from "@/app/libs/validate";
import Graphics from "@/components/Auth/Graphics";
import SlideOnReveal from "@/components/SlideOnReveal";
import { integrations, messages } from "../../../integrations.config";
import z from "zod";

const schema = z.object({
  fullName: z
    .string()
    .min(3, "Please enter your full name.")
    .max(25, "Full name is too long."),
  email: z.string().email("Please enter a valid email address."),
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

const Signup = () => {
  const [isPassword, setIsPassword] = useState(false);
  const [data, setData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { fullName, email, password } = data;

  const validateForm = (isEmail: boolean) => {
    const result = schema.safeParse(data);

    if (!result.success) {
      if (isEmail) {
        toast.error(result.error.errors[2].message);
        return false;
      } else {
        result.error.errors.forEach((error) => {
          toast.error(error.message);
        });
        return false;
      }
    }
    return true;
  };

  const registerUser = async (e: any) => {
    e.preventDefault();

    if (!integrations.isAuthEnabled) {
      toast.error(messages.auth);
      return;
    }

    if (!validateForm(false)) return;

    axios
      .post("/api/register", {
        name: `${fullName}`,
        email,
        password,
      })
      .then(() => {
        toast.success("User has been registered");
        setData({
          fullName: "",
          email: "",
          password: "",
        });
      })
      .catch(() => toast.error("Something went wrong"));
  };

  const signinWithMail = () => {
    if (!integrations.isAuthEnabled) {
      toast.error(messages.auth);
      return;
    }

    if (!validateForm(true)) {
      return;
    }

    if (!validateEmail(email)) {
      return toast.error("Please enter a valid email address.");
    } else {
      signIn("email", {
        redirect: false,
        email: email,
      })
        .then((callback) => {
          if (callback?.ok) {
            toast.success("Email sent");
            setData({ ...data, email: "" });
          }
        })
        .catch((error) => {
          toast.error(error);
        });
    }
  };

  return (
    <>
      {/* <!-- ===== SignUp Form Start ===== --> */}
      <section className="relative z-10 pt-[180px]">
        <div className="container">
          <div className="mx-[-16px] flex flex-wrap">
            <div className="w-full px-4">
              <SlideOnReveal delay={0.3}>
                <div className="wow fadeInUp dark:bg-dark mx-auto max-w-[500px] rounded-md border border-[#f5f5f5] bg-white p-12 sm:p-[60px] dark:border-0">
                  <h3 className="mb-3 text-center text-2xl font-bold text-black sm:text-3xl dark:text-white">
                    Create your account
                  </h3>
                  <p className="text-body-color-2 dark:text-body-color mb-11 text-center text-base font-medium">
                    It&apos;s totally free and super easy
                  </p>

                  <button
                    aria-label="sign with google"
                    onClick={() => signIn("google")}
                    className="shadow-one dark:shadow-signUp border-body-color/50 text-body-color-2 hover:text-primary dark:border-body-color/30 dark:text-body-color mb-6 flex w-full items-center justify-center rounded-full border bg-white p-3 text-base font-medium dark:bg-[#1F2656] dark:hover:text-white"
                  >
                    <span className="mr-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_95:967)">
                          <path
                            d="M20.0001 10.2216C20.0122 9.53416 19.9397 8.84776 19.7844 8.17725H10.2042V11.8883H15.8277C15.7211 12.539 15.4814 13.1618 15.1229 13.7194C14.7644 14.2769 14.2946 14.7577 13.7416 15.1327L13.722 15.257L16.7512 17.5567L16.961 17.5772C18.8883 15.8328 19.9997 13.266 19.9997 10.2216"
                            fill="#4285F4"
                          />
                          <path
                            d="M10.2042 20.0001C12.9592 20.0001 15.2721 19.1111 16.9616 17.5778L13.7416 15.1332C12.88 15.7223 11.7235 16.1334 10.2042 16.1334C8.91385 16.126 7.65863 15.7206 6.61663 14.9747C5.57464 14.2287 4.79879 13.1802 4.39915 11.9778L4.27957 11.9878L1.12973 14.3766L1.08856 14.4888C1.93689 16.1457 3.23879 17.5387 4.84869 18.512C6.45859 19.4852 8.31301 20.0005 10.2046 20.0001"
                            fill="#34A853"
                          />
                          <path
                            d="M4.39911 11.9777C4.17592 11.3411 4.06075 10.673 4.05819 9.99996C4.0623 9.32799 4.17322 8.66075 4.38696 8.02225L4.38127 7.88968L1.19282 5.4624L1.08852 5.51101C0.372885 6.90343 0.00012207 8.4408 0.00012207 9.99987C0.00012207 11.5589 0.372885 13.0963 1.08852 14.4887L4.39911 11.9777Z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M10.2042 3.86663C11.6663 3.84438 13.0804 4.37803 14.1498 5.35558L17.0296 2.59996C15.1826 0.901848 12.7366 -0.0298855 10.2042 -3.6784e-05C8.3126 -0.000477834 6.45819 0.514732 4.8483 1.48798C3.2384 2.46124 1.93649 3.85416 1.08813 5.51101L4.38775 8.02225C4.79132 6.82005 5.56974 5.77231 6.61327 5.02675C7.6568 4.28118 8.91279 3.87541 10.2042 3.86663Z"
                            fill="#EB4335"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_95:967">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    Sign up with Google
                  </button>

                  <div className="mb-8 flex items-center justify-center">
                    <span className="bg-body-color/50 hidden h-[1px] w-full max-w-[60px] sm:block"></span>
                    <p className="text-body-color-2 dark:text-body-color w-full px-5 text-center text-base font-medium">
                      Or, register with your email
                    </p>
                    <span className="bg-body-color/50 hidden h-[1px] w-full max-w-[60px] sm:block"></span>
                  </div>

                  <div className="border-body-color/50 mx-auto mb-12 flex flex-col items-center justify-center gap-1 rounded-lg border p-1 md:flex-row">
                    <button
                      className={`text-body-color hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary w-full rounded-lg px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:text-white dark:hover:shadow-none ${
                        !isPassword &&
                        "bg-primary/5 text-primary dark:border-primary dark:bg-primary/5 border"
                      }`}
                      onClick={() => setIsPassword(false)}
                    >
                      Magic Link
                    </button>
                    <button
                      className={`text-body-color hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary w-full rounded-lg px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:text-white dark:hover:shadow-none ${
                        isPassword &&
                        "bg-primary/5 text-primary dark:border-primary dark:bg-primary/5 border"
                      }`}
                      onClick={() => setIsPassword(true)}
                    >
                      Password
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className={`${!isPassword ? "" : "hidden"}`}
                  >
                    <div>
                      <input
                        type="email"
                        value={email}
                        placeholder="Email"
                        className="shadow-one dark:shadow-signUp border-body-color/50 text-body-color placeholder-body-color focus:border-primary dark:border-body-color/30 w-full rounded-full border bg-transparent px-6 py-3 text-base outline-hidden focus-visible:shadow-none dark:bg-[#1F2656]"
                        required
                        onChange={(e) =>
                          setData({ ...data, email: e.target.value })
                        }
                      />

                      <div className="mt-6">
                        <button
                          aria-label="login with email and password"
                          className="hover:shadow-signUp bg-primary hover:bg-primary/80 flex w-full items-center justify-center rounded-full px-9 py-4 text-base font-medium text-white transition duration-300 ease-in-out"
                          onClick={signinWithMail}
                        >
                          Send Magic Link
                        </button>
                      </div>
                    </div>
                  </form>

                  <form
                    onSubmit={registerUser}
                    className={isPassword ? "" : "hidden"}
                  >
                    <div className="mb-8">
                      <label
                        htmlFor="fullName"
                        className="text-dark mb-3 block text-sm font-medium dark:text-white"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="First and last name"
                        value={data.fullName}
                        onChange={(e) =>
                          setData({ ...data, [e.target.name]: e.target.value })
                        }
                        required
                        className="shadow-one dark:shadow-signUp border-body-color/50 text-body-color placeholder-body-color focus:border-primary dark:border-body-color/30 w-full rounded-full border bg-transparent px-6 py-3 text-base outline-hidden focus-visible:shadow-none dark:bg-[#1F2656]"
                      />
                    </div>

                    <div className="mb-8">
                      <label
                        htmlFor="email"
                        className="text-dark mb-3 block text-sm font-medium dark:text-white"
                      >
                        Work Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={data.email}
                        onChange={(e) =>
                          setData({ ...data, [e.target.name]: e.target.value })
                        }
                        required
                        className="shadow-one dark:shadow-signUp border-body-color/50 text-body-color placeholder-body-color focus:border-primary dark:border-body-color/30 w-full rounded-full border bg-transparent px-6 py-3 text-base outline-hidden focus-visible:shadow-none dark:bg-[#1F2656]"
                      />
                    </div>

                    <div className="mb-8">
                      <label
                        htmlFor="password"
                        className="text-dark mb-3 block text-sm font-medium dark:text-white"
                      >
                        Your password
                      </label>

                      <input
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={data.password}
                        onChange={(e) =>
                          setData({ ...data, [e.target.name]: e.target.value })
                        }
                        required
                        className="shadow-one dark:shadow-signUp border-body-color/50 text-body-color placeholder-body-color focus:border-primary dark:border-body-color/30 w-full rounded-full border bg-transparent px-6 py-3 text-base outline-hidden focus-visible:shadow-none dark:bg-[#1F2656]"
                      />
                    </div>

                    <div className="mb-8 flex">
                      <label
                        htmlFor="checkboxLabel"
                        className="text-body-color-2 dark:text-body-color flex cursor-pointer text-sm font-medium select-none"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="checkboxLabel"
                            id="checkboxLabel"
                            className="sr-only"
                          />
                          <div className="box border-body-color/30 mt-1 mr-4 flex size-5 items-center justify-center rounded-sm border dark:border-white/10">
                            <span className="opacity-0">
                              <svg
                                width="11"
                                height="8"
                                viewBox="0 0 11 8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                                  fill="#3056D3"
                                  stroke="#3056D3"
                                  strokeWidth="0.4"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <span>
                          By creating account means you agree to the
                          <Link
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Terms and Conditions
                          </Link>
                          , and our
                          <Link
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                    </div>

                    <div className="mb-6">
                      <button
                        aria-label="signup with email and password"
                        type="submit"
                        className="hover:shadow-signUp bg-primary hover:bg-primary/80 flex w-full items-center justify-center rounded-full px-9 py-4 text-base font-medium text-white transition duration-300 ease-in-out"
                      >
                        Sign Up
                      </button>
                    </div>

                    <p className="text-body-color-2 dark:text-body-color text-center text-base font-medium">
                      Already using Startup?{" "}
                      <Link
                        href="/auth/signin"
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </form>
                </div>
              </SlideOnReveal>
            </div>
          </div>
        </div>

        <Graphics />
      </section>
      {/* <!-- ===== SignUp Form End ===== --> */}
    </>
  );
};

export default Signup;
