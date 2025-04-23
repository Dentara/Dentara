"use client";

import React, { useState } from "react";
import SlideOnReveal from "@/components/SlideOnReveal";
import z from "zod";
import toast from "react-hot-toast";

const schema = z.object({
  name: z
    .string()
    .min(3, "Please enter your full name.")
    .max(25, "Full name is too long."),
  email: z.string().email("Please enter a valid email address."),
  message: z
    .string()
    .min(10)
    .refine(
      (val) => {
        const pattern = /(<([^>]+)>)/gi;
        return !pattern.test(val);
      },
      {
        message: "Message must not contain HTML tags.",
      },
    ),
});

interface ContactData {
  title: string;
  child: string[];
}

const contactData: ContactData[] = [
  {
    title: "Our Location",
    child: ["401 Broadway, 24th Floor, Orchard Cloud View, London"],
  },
  {
    title: "Email Address",
    child: ["info@yourdomain.com", "contact@yourdomain.com"],
  },
  {
    title: "Phone Number",
    child: ["+990 846 73644", "+550 9475 4543"],
  },
  {
    title: "How Can We Help?",
    child: ["Tell us your problem we will get back to you ASAP."],
  },
];

const formData = [
  {
    label: "Full Name*",
    type: "text",
    name: "name",
    placeholder: "Enter your full name",
  },
  {
    label: "Email Address*",
    type: "email",
    name: "email",
    placeholder: "Enter your email address",
  },
  {
    label: "Message*",
    type: "message",
    name: "message",
    placeholder: "Type your message",
  },
];

const Contact = ({ sectionClasses }: any) => {
  const [data, setData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const result = schema.safeParse(data);
    if (!result.success) {
      result.error.errors.forEach((error) => {
        toast.error(error.message);
      });
      return;
    }

    console.log(data);

    toast.success("Data in right format");
  };
  return (
    <>
      <section id="contact" className={sectionClasses}>
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-7/12">
              <SlideOnReveal delay={0.3}>
                <div
                  className="wow fadeInUp mb-16 max-w-[350px]"
                  data-wow-delay="0s"
                >
                  <span className="text-primary mb-3 text-lg font-bold uppercase sm:text-xl">
                    Contact Us
                  </span>
                  <h2 className="mb-3 text-3xl leading-tight font-bold text-black md:text-[45px] dark:text-white">
                    Let&apos;s talk about your problem.
                  </h2>
                </div>
              </SlideOnReveal>

              <div className="-mx-4 flex flex-wrap">
                {contactData.map((item, index) => (
                  <div key={index} className="w-full px-4 sm:w-1/2">
                    <SlideOnReveal delay={0.3}>
                      <div
                        className="wow fadeInUp mb-11 max-w-[250px]"
                        data-wow-delay="0s"
                      >
                        <h3 className="text-dark mb-4 text-lg font-semibold dark:text-white">
                          {item.title}
                        </h3>
                        {item.child.map((childItem, childIndex) => (
                          <p
                            key={childIndex}
                            className="text-body-color-2 dark:text-body-color text-base leading-loose font-medium"
                          >
                            {childItem}
                          </p>
                        ))}
                      </div>
                    </SlideOnReveal>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full px-4 lg:w-5/12">
              <SlideOnReveal delay={0.3}>
                <div
                  className="sm:14 wow fadeInUp dark:bg-dark rounded-md bg-white px-8 py-12"
                  data-wow-delay="0s"
                >
                  <h3 className="text-dark mb-8 text-2xl font-bold sm:text-[34px] lg:text-2xl xl:text-[34px] dark:text-white">
                    Send us a Message
                  </h3>

                  <form onSubmit={handleSubmit}>
                    {formData.map((item, index) =>
                      item.type === "message" ? (
                        <div key={index} className="mb-5">
                          <label
                            htmlFor={item.name}
                            className="text-dark mb-2 block text-sm font-medium dark:text-white"
                          >
                            {item.label}
                          </label>

                          <textarea
                            onChange={handleChange}
                            name={data?.message}
                            rows={6}
                            id={item.name}
                            // value={data[item.name] || ""}
                            placeholder="Type your message"
                            className="text-body-color focus:border-primary w-full rounded-md border border-[#E9E9E9]/50 bg-transparent px-5 py-3 text-base font-medium outline-hidden dark:border-[#E9E9E9]/20 dark:bg-white/5"
                          ></textarea>
                        </div>
                      ) : (
                        <div key={index} className="mb-5">
                          <label
                            htmlFor={item.name}
                            className="text-dark mb-2 block text-sm font-medium dark:text-white"
                          >
                            {item.label}
                          </label>

                          <input
                            type={item.type}
                            id={item.name}
                            name={item.name}
                            // value={data[item.name] || ""}
                            placeholder={item.placeholder}
                            onChange={handleChange}
                            className="text-body-color focus:border-primary w-full rounded-md border border-[#E9E9E9]/50 bg-transparent px-5 py-3 text-base font-medium outline-hidden dark:border-[#E9E9E9]/20 dark:bg-white/5"
                          />
                        </div>
                      ),
                    )}

                    <button className="bg-primary hover:bg-primary/90 w-full rounded-full p-3 text-center text-base font-semibold text-white dark:bg-white dark:text-black dark:hover:bg-white/90">
                      Send Message
                    </button>
                  </form>
                </div>
              </SlideOnReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
