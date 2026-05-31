"use client";

import { useState } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";
import { StaggerGrid, StaggerItem } from "@/lib/animations";

const RecruitmentForm = () => {
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Department: "",
    Year: "",
    Skills: "",
    Motivation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      const res = await axios.post("/api/recruitment/submit", formData);
      setSubmitStatus("success");
      setFormData({
        Name: "",
        Email: "",
        Department: "",
        Year: "",
        Skills: "",
        Motivation: "",
      });
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { id: "Name", label: "Full Name", placeholder: "John Doe", type: "text", colSpan: "md:col-span-1" },
    { id: "Email", label: "Email Address", placeholder: "john.doe@g.bracu.ac.bd", type: "email", colSpan: "md:col-span-1" },
    { id: "Department", label: "Department", placeholder: "Computer Science & Engineering", type: "text", colSpan: "md:col-span-1" },
    { id: "Year", label: "Year of Study", placeholder: "2nd Year", type: "text", colSpan: "md:col-span-1" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="bg-background/50 backdrop-blur-sm border border-text-secondary/10 rounded-2xl p-8 shadow-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {fields.map((field, i) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <label
                htmlFor={field.id.toLowerCase()}
                className="block text-text-muted mb-2 font-medium"
              >
                {field.label}
              </label>
              <input
                id={field.id.toLowerCase()}
                value={formData[field.id as keyof typeof formData]}
                type={field.type}
                placeholder={field.placeholder}
                required
                onChange={(e) =>
                  setFormData({ ...formData, [field.id]: e.target.value })
                }
                className="w-full bg-background/80 border border-text-secondary/20 rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300"
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <label
            htmlFor="skills"
            className="block text-text-muted mb-2 font-medium"
          >
            Skills & Interests
          </label>
          <input
            id="skills"
            value={formData.Skills}
            type="text"
            placeholder="Photography, First Aid, Navigation, etc."
            required
            onChange={(e) =>
              setFormData({ ...formData, Skills: e.target.value })
            }
            className="w-full bg-background/80 border border-text-secondary/20 rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <label
            htmlFor="motivation"
            className="block text-text-muted mb-2 font-medium"
          >
            Why do you want to join BUAC?
          </label>
          <textarea
            id="motivation"
            value={formData.Motivation}
            placeholder="Tell us what drives your passion for adventure and why you'd be a great fit for BUAC..."
            required
            rows={6}
            onChange={(e) =>
              setFormData({ ...formData, Motivation: e.target.value })
            }
            className="w-full bg-background/80 border border-text-secondary/20 rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 resize-none"
          />
        </motion.div>

        {submitStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-green-500/10 border border-green-500/30 text-green-600 px-4 py-3 rounded-xl"
          >
            Application submitted successfully! We&apos;ll get back to you soon.
          </motion.div>
        )}

        {submitStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl"
          >
            Failed to submit application. Please try again.
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-accent hover:bg-accent/90 text-white font-bebasNeue text-xl tracking-wider py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              Submit Application <FaPaperPlane className="text-lg" />
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default RecruitmentForm;