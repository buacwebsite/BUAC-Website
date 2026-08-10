"use client";

import React, { useState } from "react";
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
  FaPaperPlane,
} from "react-icons/fa6";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useEditor } from "@/app/context/EditorContext";
import { useAuth } from "@/app/context/AuthProvider";
import { motion } from "framer-motion";
import BUACLoader from "@/app/components/ui/BUACLoader";
import {
  MotionSection,
  RevealHeading,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
} from "@/lib/animations";
import {
  STATIC_CONTACT,
  type ContactContent,
} from "@/lib/siteContent";
import { usePublicContent } from "@/lib/publicContent";

const Contact = () => {
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const { data: apiData } = usePublicContent<{ contact: ContactContent }>(
    "/api/content/contact",
    { contact: STATIC_CONTACT },
  );

  const content = apiData?.contact || STATIC_CONTACT;

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

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await axios.post("/api/contact/send", data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status !== 200) {
        setSubmitStatus({
          type: "error",
          message: response.data.error || "Failed to send message",
        });
      } else {
        setSubmitStatus({ type: "success", message: response.data.message });
        reset();
        setTimeout(() => setSubmitStatus({ type: null, message: "" }), 5000);
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MotionSection className="buac-gradient-bg min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          {auth && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              onClick={() => openEditor("contact", content)}
              className="absolute top-0 right-4 bg-accent text-white py-2 px-4 flex items-center justify-center gap-2 text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
              title="Edit Contact Content"
            >
              <HiOutlinePencilAlt className="text-xl" />
              Edit
            </motion.button>
          )}

          <RevealHeading className="font-bebasNeue text-6xl md:text-8xl text-text-secondary mb-4 tracking-wider">
            {content.heading}
          </RevealHeading>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto"
          >
            {content.subheading}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInLeft}
            className="space-y-8"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="bg-surface backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
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
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="bg-surface backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
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
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="bg-accent/5 backdrop-blur-sm border border-accent/20 rounded-2xl p-8 shadow-xl"
            >
              <h3 className="font-bebasNeue text-2xl text-text-secondary mb-6 tracking-wide">
                Follow Our Journey
              </h3>
              <div className="flex gap-4">
                {[
                  { href: content.socialLinks.facebook, icon: <FaFacebook className="text-3xl" /> },
                  { href: content.socialLinks.instagram, icon: <FaInstagram className="text-3xl" /> },
                  { href: content.socialLinks.linkedin, icon: <FaLinkedin className="text-3xl" /> },
                ].map((social, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.15, rotate: 5 }} transition={{ duration: 0.2 }}>
                    <Link
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-surface hover:bg-accent/20 p-4 rounded-xl transition-all duration-300 group block"
                    >
                      <span className="text-text-secondary group-hover:text-accent transition-colors">
                        {social.icon}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInRight}
            className="bg-surface backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl"
          >
            <h3 className="font-bebasNeue text-3xl text-text-secondary mb-6 tracking-wide">
              Send Us a Message
            </h3>

            {submitStatus.type && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl ${
                  submitStatus.type === "success"
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {submitStatus.message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {(["name", "email", "subject"] as const).map((field, i) => (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <label htmlFor={field} className="block text-text-muted mb-2 font-medium capitalize">
                    {field === "name" ? "Your Name" : field === "email" ? "Email Address" : "Subject"}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    id={field}
                    {...register(field)}
                    className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 ${
                      errors[field] ? "border-red-500/50" : "border-input-border"
                    }`}
                    placeholder={
                      field === "name" ? "John Doe" : field === "email" ? "john@example.com" : "Interested in joining a trek"
                    }
                  />
                  {errors[field] && (
                    <p className="mt-1 text-sm text-red-400">{errors[field].message}</p>
                  )}
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <label htmlFor="message" className="block text-text-muted mb-2 font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  {...register("message")}
                  rows={5}
                  className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 resize-none ${
                    errors.message ? "border-red-500/50" : "border-input-border"
                  }`}
                  placeholder="Tell us about your adventure plans..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bebasNeue text-xl tracking-wider py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <BUACLoader size="sm" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <FaPaperPlane className="text-lg" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="bg-accent/5 backdrop-blur-sm border border-accent/20 rounded-2xl p-12 text-center shadow-xl"
        >
          <h2 className="font-bebasNeue text-4xl md:text-5xl text-text-secondary mb-4 tracking-wider">
            {content.ctaHeading}
          </h2>
          <p className="text-text-muted text-lg max-w-3xl mx-auto mb-8">
            {content.ctaDescription}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/tours"
              className="inline-block bg-accent hover:bg-accent/90 text-white font-bebasNeue text-xl tracking-wider px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explore Our Tours
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </MotionSection>
  );
};

export default Contact;