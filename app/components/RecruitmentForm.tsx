"use client";

import { useState } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";

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

  return (
    <div className="bg-background/50 backdrop-blur-sm border border-text-secondary/10 rounded-2xl p-8 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-text-muted mb-2 font-medium"
            >
              Full Name
            </label>
            <input
              id="name"
              value={formData.Name}
              type="text"
              placeholder="John Doe"
              required
              onChange={(e) =>
                setFormData({ ...formData, Name: e.target.value })
              }
              className="w-full bg-background/80 border border-text-secondary/20 rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-text-muted mb-2 font-medium"
            >
              Email Address
            </label>
            <input
              id="email"
              value={formData.Email}
              type="email"
              placeholder="john.doe@g.bracu.ac.bd"
              required
              onChange={(e) =>
                setFormData({ ...formData, Email: e.target.value })
              }
              className="w-full bg-background/80 border border-text-secondary/20 rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="department"
              className="block text-text-muted mb-2 font-medium"
            >
              Department
            </label>
            <input
              id="department"
              value={formData.Department}
              type="text"
              placeholder="Computer Science & Engineering"
              required
              onChange={(e) =>
                setFormData({ ...formData, Department: e.target.value })
              }
              className="w-full bg-background/80 border border-text-secondary/20 rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="year"
              className="block text-text-muted mb-2 font-medium"
            >
              Year of Study
            </label>
            <input
              id="year"
              value={formData.Year}
              type="text"
              placeholder="2nd Year"
              required
              onChange={(e) =>
                setFormData({ ...formData, Year: e.target.value })
              }
              className="w-full bg-background/80 border border-text-secondary/20 rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300"
            />
          </div>
        </div>

        <div>
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
        </div>

        <div>
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
        </div>

        {submitStatus === "success" && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-600 px-4 py-3 rounded-xl">
            Application submitted successfully! We&apos;ll get back to you soon.
          </div>
        )}

        {submitStatus === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl">
            Failed to submit application. Please try again.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent hover:bg-accent/90 text-white font-bebasNeue text-xl tracking-wider py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              Submit Application <FaPaperPlane className="text-lg" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RecruitmentForm;
