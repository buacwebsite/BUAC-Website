"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaMountain,
  FaHiking,
  FaCompass,
  FaCampground,
  FaUsers,
  FaFire,
  FaPaperPlane,
} from "react-icons/fa";

const benefits = [
  {
    title: "Epic Adventures",
    description:
      "Explore breathtaking mountains, valleys, and trails across Bangladesh",
  },
  {
    title: "Skill Development",
    description:
      "Learn trekking, camping, navigation, and survival skills from experts",
  },
  {
    title: "Leadership",
    description:
      "Develop leadership qualities by organizing and leading expeditions",
  },
  {
    title: "Unforgettable Memories",
    description:
      "Create lasting bonds and memories around campfires under starry skies",
  },
  {
    title: "Vibrant Community",
    description:
      "Join a passionate community of adventure seekers and outdoor enthusiasts",
  },
  {
    title: "Personal Growth",
    description:
      "Push your limits, build resilience, and discover your true potential",
  },
];

const benefitIcons = [
  <FaMountain key="mountain" className="text-4xl text-accent" />,
  <FaHiking key="hiking" className="text-4xl text-accent" />,
  <FaCompass key="compass" className="text-4xl text-accent" />,
  <FaCampground key="camp" className="text-4xl text-accent" />,
  <FaUsers key="users" className="text-4xl text-accent" />,
  <FaFire key="fire" className="text-4xl text-accent" />,
];

const essentialQualities = [
  "Current BRAC University student with valid student ID",
  "Passion for outdoor activities and adventure",
  "Commitment to attend regular club activities",
  "Team player with positive attitude",
];

const bonusPoints = [
  "Previous trekking or camping experience",
  "Photography or videography skills",
  "Social media management experience",
  "Event organization or leadership roles",
];

const genders = ["Male", "Female", "Other"];

const religions = [
  "Islam",
  "Hinduism",
  "Christianity",
  "Buddhism",
  "Other",
];

const departments = [
  "MNS",
  "EEE",
  "CSE",
  "CS",
  "ECO",
  "LLB",
  "Pharmacy",
  "Architecture",
  "BBA",
  "ESS",
  "Other",
];

const semesters = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "13th",
  "14th",
  "Other",
];

const bloodGroups = [
  "A+ ve",
  "A- ve",
  "B+ ve",
  "B- ve",
  "O+ ve",
  "O- ve",
  "AB+ ve",
  "AB- ve",
];

const bloodDonationOptions = ["Yes", "No", "Maybe"];

const initialForm = {
  name: "",
  studentId: "",
  address: "",
  gender: "",
  religion: "",
  contact: "",
  facebook: "",
  department: "",
  semester: "",
  bloodGroup: "",
  bloodDonation: "",
  email: "",
};

const ClubFair = () => {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [semesterLabel, setSemesterLabel] = useState<string>("");

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get("/api/club-fair/count");
        setLiveCount(res.data.count);
        setSemesterLabel(res.data.semester || "");
      } catch (err) {
        console.error("Failed to fetch live count:", err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const required: [keyof typeof form, string][] = [
      ["name", "Name"],
      ["studentId", "Student ID"],
      ["address", "Address"],
      ["gender", "Gender"],
      ["religion", "Religion"],
      ["contact", "Contact Number"],
      ["facebook", "Facebook Profile Link"],
      ["department", "University Department"],
      ["semester", "Semester"],
      ["bloodGroup", "Blood Group"],
      ["bloodDonation", "Blood Donation interest"],
      ["email", "G-Suite Email"],
    ];

    for (const [key, label] of required) {
      if (!form[key].trim()) return `${label} is required.`;
    }

    if (
      !form.email.trim().toLowerCase().endsWith("@g.bracu.ac.bd")
    ) {
      return "Please use a valid BRACU G-Suite email (@g.bracu.ac.bd).";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: "" });

    const error = validate();

    if (error) {
      setSubmitStatus({ type: "error", message: error });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post("/api/club-fair/submit", {
        Name: form.name,
        StudentID: form.studentId,
        Address: form.address,
        Gender: form.gender,
        Religion: form.religion,
        Contact: form.contact,
        Facebook: form.facebook,
        Department: form.department,
        Semester: form.semester,
        BloodGroup: form.bloodGroup,
        BloodDonation: form.bloodDonation,
        Email: form.email.trim().toLowerCase(),
      });

      setSubmitStatus({
        type: "success",
        message:
          "Registration submitted successfully! See you at the fair.",
      });

      setForm(initialForm);

      if (typeof res.data?.total === "number") {
        setLiveCount(res.data.total);
      } else {
        setLiveCount((prev) => (prev !== null ? prev + 1 : prev));
      }
    } catch (err) {
      console.error("Club fair submit error:", err);

      setSubmitStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300";

  const RequiredMark = () => (
    <span className="text-accent">*</span>
  );

  return (
    <div className="buac-gradient-bg min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-bebasNeue text-6xl md:text-8xl text-text-secondary mb-4 tracking-wider">
            CLUB FAIR REGISTRATION
          </h1>
          <p className="text-text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Meet BUAC at the Club Fair and take your first step into
            the world of adventure. Register below to stay connected.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-20 rounded-3xl border-2 border-accent/30 bg-surface/60 backdrop-blur-md p-10 md:p-16 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            <span className="text-sm font-semibold uppercase tracking-widest text-green-500">
              Live
            </span>
          </div>

          <p className="text-text-muted uppercase tracking-[0.3em] text-sm mb-4">
            Total Registrations
          </p>

          <motion.div
            key={liveCount ?? "loading"}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="font-bebasNeue text-8xl md:text-[12rem] leading-none text-accent tracking-wider"
          >
            {liveCount !== null
              ? liveCount.toLocaleString()
              : "—"}
          </motion.div>

          <p className="text-text-secondary text-lg md:text-xl mt-4">
            Adventurers have already registered. Join them!
          </p>

          {semesterLabel && (
            <p className="mt-3 inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              {semesterLabel}
            </p>
          )}
        </motion.div>

        <div className="mb-20">
          <h2 className="font-bebasNeue text-4xl md:text-5xl text-text-secondary text-center mb-12 tracking-wider">
            Why Join BUAC?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-surface/70 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-accent/30"
              >
                <div className="bg-accent/10 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  {benefitIcons[index]}
                </div>
                <h3 className="font-bebasNeue text-2xl text-text-secondary mb-2 tracking-wide">
                  {benefit.title}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface/70 backdrop-blur-md border border-accent/20 rounded-2xl p-8 md:p-12 mb-16 shadow-xl">
          <h2 className="font-bebasNeue text-3xl md:text-4xl text-text-secondary mb-6 tracking-wider">
            What We&apos;re Looking For
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-text-muted">
            <div>
              <h3 className="font-bebasNeue text-xl text-text-secondary mb-3 tracking-wide">
                Essential Qualities
              </h3>
              <ul className="space-y-4">
                {essentialQualities.map((quality, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-accent">■</span>
                    <span>{quality}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bebasNeue text-xl text-text-secondary mb-3 tracking-wide">
                Bonus Points
              </h3>
              <ul className="space-y-4">
                {bonusPoints.map((point, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-accent">■</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-text-muted text-lg max-w-2xl mx-auto leading-relaxed">
                Discover your inner explorer and join BUAC on a
                journey of self-discovery! Immerse yourself in
                thrilling outdoor adventures, surrounded by
                breathtaking landscapes and eco-friendly initiatives.
              </p>
              <p className="text-text-muted text-lg max-w-2xl mx-auto mt-4">
                Fill out the form below and dive into the excitement.
              </p>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              onSubmit={handleSubmit}
              className="bg-surface/70 backdrop-blur-md border border-border rounded-2xl p-8 shadow-xl space-y-6"
            >
              {submitStatus.type && (
                <div
                  className={`p-4 rounded-xl ${
                    submitStatus.type === "success"
                      ? "bg-green-500/10 border border-green-500/30 text-green-500"
                      : "bg-red-500/10 border border-red-500/30 text-red-500"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-text-muted mb-2 font-medium">
                    Name <RequiredMark />
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="John Doe"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-text-muted mb-2 font-medium">
                    Student ID <RequiredMark />
                  </label>
                  <input
                    type="text"
                    value={form.studentId}
                    onChange={(e) =>
                      update("studentId", e.target.value)
                    }
                    placeholder="24101XXX"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-text-muted mb-2 font-medium">
                    Address <RequiredMark />
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      update("address", e.target.value)
                    }
                    placeholder="Your current address"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-text-muted mb-2 font-medium">
                    Gender <RequiredMark />
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select gender</option>
                    {genders.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-muted mb-2 font-medium">
                    Religion <RequiredMark />
                  </label>
                  <select
                    value={form.religion}
                    onChange={(e) =>
                      update("religion", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select religion</option>
                    {religions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-muted mb-2 font-medium">
                    Contact Number <RequiredMark />
                  </label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(e) =>
                      update("contact", e.target.value)
                    }
                    placeholder="01XXXXXXXXX"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-text-muted mb-2 font-medium">
                    Facebook Profile Link <RequiredMark />
                  </label>
                  <input
                    type="text"
                    value={form.facebook}
                    onChange={(e) =>
                      update("facebook", e.target.value)
                    }
                    placeholder="https://facebook.com/..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-text-muted mb-2 font-medium">
                    University Department <RequiredMark />
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) =>
                      update("department", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-muted mb-2 font-medium">
                    Semester in BRACU <RequiredMark />
                  </label>
                  <select
                    value={form.semester}
                    onChange={(e) =>
                      update("semester", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select semester</option>
                    {semesters.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-muted mb-2 font-medium">
                    Blood Group <RequiredMark />
                  </label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) =>
                      update("bloodGroup", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select blood group</option>
                    {bloodGroups.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-muted mb-2 font-medium">
                    Interested in Blood Donation? <RequiredMark />
                  </label>
                  <div className="flex gap-2">
                    {bloodDonationOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          update("bloodDonation", opt)
                        }
                        className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold transition-all cursor-pointer ${
                          form.bloodDonation === opt
                            ? "border-accent bg-accent text-white"
                            : "border-border bg-input-bg text-text-muted hover:border-accent/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-text-muted mb-2 font-medium">
                    G-Suite Email <RequiredMark />
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="yourname@g.bracu.ac.bd"
                    className={inputClass}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bebasNeue text-xl tracking-wider py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Application{" "}
                    <FaPaperPlane className="text-lg" />
                  </>
                )}
              </motion.button>
            </motion.form>
          </div>
        </div>

        <div className="bg-surface/70 backdrop-blur-md border border-accent/20 rounded-2xl p-12 text-center shadow-xl">
          <h2 className="font-bebasNeue text-3xl md:text-4xl text-text-secondary mb-4 tracking-wider">
            Questions About Recruitment?
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto mb-8">
            Feel free to reach out to us. We&apos;re here to help and
            answer any questions you might have about joining BUAC.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-accent hover:bg-accent/90 text-white font-bebasNeue text-xl tracking-wider px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClubFair;