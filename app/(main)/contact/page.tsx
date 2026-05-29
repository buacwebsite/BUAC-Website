"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { contactSchema, type ContactFormData } from "@/lib/validations/contact";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaLocationDot,
  FaPhone,
  FaPaperPlane,
} from "react-icons/fa6";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useEditor } from "@/app/context/EditorContext";
import { useAuth } from "@/app/context/AuthProvider";

interface ContactContent {
  heading: string;
  subheading: string;
  location: {
    line1: string;
    line2: string;
    line3: string;
  };
  email: string;
  phone: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  ctaHeading: string;
  ctaDescription: string;
}

const Contact = () => {
  const [content, setContent] = useState<ContactContent | null>(null);
  const { auth } = useAuth();
  const { openEditor } = useEditor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get("/api/content/contact");
        setContent(res.data.contact);
      } catch (error) {
        console.error("Failed to fetch contact content:", error);
      }
    };
    fetchContent();
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await axios.post("/api/contact/send", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = response.data;

      if (response.status !== 200) {
        setSubmitStatus({
          type: "error",
          message: responseData.error || "Failed to send message",
        });
      } else {
        setSubmitStatus({
          type: "success",
          message: responseData.message,
        });
        reset();
        setTimeout(() => {
          setSubmitStatus({ type: null, message: "" });
        }, 5000);
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-background/80 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          {auth && (
            <button
              onClick={() => openEditor("contact", content)}
              className="absolute top-0 right-4 bg-accent text-white py-2 px-4 flex items-center justify-center gap-2 text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
              title="Edit Contact Content"
            >
              <HiOutlinePencilAlt className="text-xl" />
              Edit
            </button>
          )}
          <h1 className="font-bebasNeue text-6xl md:text-8xl text-text-secondary mb-4 tracking-wider">
            {content.heading}
          </h1>
          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto">
            {content.subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-8">
            <div className="bg-background/50 backdrop-blur-sm border border-text-secondary/10 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start gap-6">
                <div className="bg-accent/10 p-4 rounded-xl">
                  <FaLocationDot className="text-3xl text-accent" />
                </div>
                <div>
                  <h3 className="font-bebasNeue text-2xl text-text-secondary mb-2 tracking-wide">
                    Location
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {content.location.line1}
                    <br />
                    {content.location.line2}
                    <br />
                    {content.location.line3}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background/50 backdrop-blur-sm border border-text-secondary/10 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start gap-6">
                <div className="bg-accent/10 p-4 rounded-xl">
                  <FaEnvelope className="text-3xl text-accent" />
                </div>
                <div>
                  <h3 className="font-bebasNeue text-2xl text-text-secondary mb-2 tracking-wide">
                    Email
                  </h3>
                  <Link
                    href={`mailto:${content.email}`}
                    className="text-text-muted hover:text-accent transition-colors duration-300"
                  >
                    {content.email}
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-background/50 backdrop-blur-sm border border-text-secondary/10 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start gap-6">
                <div className="bg-accent/10 p-4 rounded-xl">
                  <FaPhone className="text-3xl text-accent" />
                </div>
                <div>
                  <h3 className="font-bebasNeue text-2xl text-text-secondary mb-2 tracking-wide">
                    Phone
                  </h3>
                  <Link
                    href={`tel:${content.phone.replace(/\s+/g, "")}`}
                    className="text-text-muted hover:text-accent transition-colors duration-300"
                  >
                    {content.phone}
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-accent/5 to-accent/10 backdrop-blur-sm border border-accent/20 rounded-2xl p-8 shadow-xl">
              <h3 className="font-bebasNeue text-2xl text-text-secondary mb-6 tracking-wide">
                Follow Our Journey
              </h3>
              <div className="flex gap-4">
                <Link
                  href={content.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background/50 hover:bg-accent/20 p-4 rounded-xl transition-all duration-300 hover:scale-110 group"
                >
                  <FaFacebook className="text-3xl text-text-secondary group-hover:text-accent transition-colors" />
                </Link>
                <Link
                  href={content.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background/50 hover:bg-accent/20 p-4 rounded-xl transition-all duration-300 hover:scale-110 group"
                >
                  <FaInstagram className="text-3xl text-text-secondary group-hover:text-accent transition-colors" />
                </Link>
                <Link
                  href={content.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background/50 hover:bg-accent/20 p-4 rounded-xl transition-all duration-300 hover:scale-110 group"
                >
                  <FaLinkedin className="text-3xl text-text-secondary group-hover:text-accent transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-background/50 backdrop-blur-sm border border-text-secondary/10 rounded-2xl p-8 shadow-xl">
            <h3 className="font-bebasNeue text-3xl text-text-secondary mb-6 tracking-wide">
              Send Us a Message
            </h3>

            {submitStatus.type && (
              <div
                className={`mb-6 p-4 rounded-xl ${
                  submitStatus.type === "success"
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-text-muted mb-2 font-medium"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name")}
                  className={`w-full bg-background/80 border rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 ${
                    errors.name
                      ? "border-red-500/50"
                      : "border-text-secondary/20"
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-text-muted mb-2 font-medium"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className={`w-full bg-background/80 border rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 ${
                    errors.email
                      ? "border-red-500/50"
                      : "border-text-secondary/20"
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-text-muted mb-2 font-medium"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  {...register("subject")}
                  className={`w-full bg-background/80 border rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 ${
                    errors.subject
                      ? "border-red-500/50"
                      : "border-text-secondary/20"
                  }`}
                  placeholder="Interested in joining a trek"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-text-muted mb-2 font-medium"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  {...register("message")}
                  rows={5}
                  className={`w-full bg-background/80 border rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 resize-none ${
                    errors.message
                      ? "border-red-500/50"
                      : "border-text-secondary/20"
                  }`}
                  placeholder="Tell us about your adventure plans..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bebasNeue text-xl tracking-wider py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message <FaPaperPlane className="text-lg" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-linear-to-r from-accent/10 via-accent/5 to-accent/10 backdrop-blur-sm border border-accent/20 rounded-2xl p-12 text-center shadow-xl">
          <h2 className="font-bebasNeue text-4xl md:text-5xl text-text-secondary mb-4 tracking-wider">
            {content.ctaHeading}
          </h2>
          <p className="text-text-muted text-lg max-w-3xl mx-auto mb-8">
            {content.ctaDescription}
          </p>
          <Link
            href="/tours"
            className="inline-block bg-accent hover:bg-accent/90 text-white font-bebasNeue text-xl tracking-wider px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Explore Our Tours
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;
