"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { motion } from "framer-motion";
import {
  HiArrowRight,
  HiEye,
  HiEyeOff,
  HiMail,
  HiPhone,
  HiUser,
  HiLink,
  HiAcademicCap,
  HiHeart,
  HiBriefcase,
  HiSparkles,
  HiCalendar,
} from "react-icons/hi";
import { FaMountain } from "react-icons/fa";
import { HiAcademicCap as HiAlumni } from "react-icons/hi2";
import CustomSelect from "@/app/components/ui/CustomSelect";

type RoleType = "member" | "alumni";

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const buacDepartments = [
  "Creative",
  "Event Management",
  "Human Resources and Management",
  "IT and Photography",
  "Publication and Marketing",
  "Panel",
];

const memberPositions = [
  "General Member",
  "Executive",
  "Coordinator",
  "Assistant Director",
  "Director",
];

const alumniPositions = ["Coordinator", "Assistant Director", "Director"];

const memberPanelPositions = [
  "President",
  "Vice President",
  "General Secretary",
  "Treasurer",
];

const alumniPanelPositions = [
  "President",
  "Vice President",
  "General Secretary",
  "Treasurer",
  "Chief of Execution",
  "Chief of Finance",
  "Chief of Tour Operation",
  "Chief of Risk Management",
];

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const AppInput = ({ icon, className = "", ...rest }: AppInputProps) => {
  return (
    <div className="relative w-full">
      <input
        className={`h-12 sm:h-13 w-full rounded-xl border-2 border-white/15 bg-black/50 px-4 pr-11 text-[15px] sm:text-sm font-light text-white outline-none transition-all duration-200 placeholder:text-white/45 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...rest}
      />
      {icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55">
          {icon}
        </div>
      )}
    </div>
  );
};

const Register = () => {
  const [role, setRole] = useState<RoleType>("member");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [facebook, setFacebook] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [donateBlood, setDonateBlood] = useState<"yes" | "no">("no");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [varsityDepartment, setVarsityDepartment] = useState("");
  const [joinSemester, setJoinSemester] = useState("");

  const [buacDepartment, setBuacDepartment] = useState("");
  const [buacPosition, setBuacPosition] = useState("");

  const [buacExDepartment, setBuacExDepartment] = useState("");
  const [buacExPosition, setBuacExPosition] = useState("");

  const [panelPosition, setPanelPosition] = useState("");

  const isPanelDepartment = useMemo(() => {
    return role === "member"
      ? buacDepartment === "Panel"
      : buacExDepartment === "Panel";
  }, [role, buacDepartment, buacExDepartment]);

  const panelOptions =
    role === "member" ? memberPanelPositions : alumniPanelPositions;

  const validate = () => {
    if (
      !name ||
      !email ||
      !contact ||
      !facebook ||
      !password ||
      !confirmPassword
    ) {
      return "Please fill in all required fields";
    }

    if (role === "member") {
      if (!email.toLowerCase().endsWith("@g.bracu.ac.bd")) {
        return "Members must use a valid BRACU G Suite email (@g.bracu.ac.bd)";
      }
      if (!varsityDepartment || !joinSemester) {
        return "Please provide varsity department and BRAC joining semester";
      }
      if (!buacDepartment) {
        return "Please select your BUAC department";
      }
      if (isPanelDepartment && !panelPosition) {
        return "Please select your panel position";
      }
      if (!isPanelDepartment && !buacPosition) {
        return "Please select your BUAC position";
      }
    }

    if (role === "alumni") {
      if (!email.toLowerCase().endsWith("@gmail.com")) {
        return "Alumni must use a Gmail address (@gmail.com)";
      }
      if (!buacExDepartment) {
        return "Please select your former BUAC department";
      }
      if (isPanelDepartment && !panelPosition) {
        return "Please select your panel position";
      }
      if (!isPanelDepartment && !buacExPosition) {
        return "Please select your former BUAC position";
      }
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const profile =
      role === "member"
        ? {
            contact,
            varsityDepartment,
            joinSemester,
            buacDepartment,
            buacPosition: isPanelDepartment ? "" : buacPosition,
            panelPosition: isPanelDepartment ? panelPosition : "",
            bloodGroup: bloodGroup || "Unknown",
            donateBlood,
            facebook,
          }
        : {
            contact,
            facebook,
            buacExDepartment,
            buacExPosition: isPanelDepartment ? "" : buacExPosition,
            panelPosition: isPanelDepartment ? panelPosition : "",
            bloodGroup: bloodGroup || "Unknown",
            donateBlood,
          };

    try {
      const res = await axios.post("/api/auth/register", {
        name,
        email: email.trim().toLowerCase(),
        password,
        role,
        profile,
      });

      if (res.status === 201) {
        window.location.href = "/";
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Registration failed");
      } else {
        setError("An unexpected error occurred during registration");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell buac-gradient-bg relative -mt-16 flex min-h-screen w-full items-center justify-center overflow-hidden px-3 sm:px-6 py-20 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl backdrop-blur-2xl sm:rounded-3xl"
      >
        <form
          className="relative z-10 grid gap-4 p-5 text-center sm:gap-5 sm:p-8 md:p-10"
          onSubmit={handleSubmit}
        >
          <Link href="/" className="mx-auto block">
            <Image
              src="/assets/logos/buac.webp"
              alt="BUAC Logo"
              width={56}
              height={56}
              className="mx-auto object-contain sm:h-[62px] sm:w-[62px]"
            />
          </Link>

          <div>
            <h1 className="font-bebasNeue text-4xl tracking-wider text-white sm:text-6xl">
              Create Account
            </h1>
            <p className="mt-1 text-xs text-white/70 sm:text-sm">
              Register as a BUAC member or alumni
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setRole("member");
                setError("");
                setBuacExDepartment("");
                setBuacExPosition("");
                setPanelPosition("");
              }}
              className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                role === "member"
                  ? "border-accent bg-accent text-white"
                  : "border-white/15 bg-white/5 text-white/70 hover:border-accent/50 hover:text-white"
              }`}
            >
              <FaMountain className="mb-1 text-base sm:text-lg" />
              <div className="text-xs font-semibold sm:text-sm">Member</div>
              <div className="text-[10px] opacity-75 sm:text-xs">
                Current BRACU student
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("alumni");
                setError("");
                setBuacDepartment("");
                setBuacPosition("");
                setPanelPosition("");
              }}
              className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                role === "alumni"
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-white/15 bg-white/5 text-white/70 hover:border-blue-400/50 hover:text-white"
              }`}
            >
              <HiAlumni className="mb-1 text-lg sm:text-xl" />
              <div className="text-xs font-semibold sm:text-sm">Alumni</div>
              <div className="text-[10px] opacity-75 sm:text-xs">
                Former BUAC member
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5 text-left sm:gap-4 md:grid-cols-2">
            <AppInput
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              icon={<HiUser className="h-5 w-5" />}
            />

            <AppInput
              placeholder={
                role === "member"
                  ? "G Suite Email (@g.bracu.ac.bd)"
                  : "Gmail Address (@gmail.com)"
              }
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              icon={<HiMail className="h-5 w-5" />}
            />

            <AppInput
              placeholder="Contact Number (01XXXXXXXXX)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={loading}
              icon={<HiPhone className="h-5 w-5" />}
            />

            <AppInput
              placeholder="Facebook Profile Link"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              disabled={loading}
              icon={<HiLink className="h-5 w-5" />}
            />

            {role === "member" && (
              <>
                <AppInput
                  placeholder="Varsity Department (e.g. CSE)"
                  value={varsityDepartment}
                  onChange={(e) => setVarsityDepartment(e.target.value)}
                  disabled={loading}
                  icon={<HiAcademicCap className="h-5 w-5" />}
                />

                <AppInput
                  placeholder="BRAC Joining Semester (e.g. Spring 2025)"
                  value={joinSemester}
                  onChange={(e) => setJoinSemester(e.target.value)}
                  disabled={loading}
                  icon={<HiCalendar className="h-5 w-5" />}
                />

                <CustomSelect
                  value={buacDepartment}
                  onChange={(val) => {
                    setBuacDepartment(val);
                    setPanelPosition("");
                    setBuacPosition("");
                  }}
                  options={buacDepartments}
                  placeholder="Select BUAC Department"
                  disabled={loading}
                  icon={<HiSparkles className="h-5 w-5" />}
                />

                {!isPanelDepartment && buacDepartment && (
                  <CustomSelect
                    value={buacPosition}
                    onChange={setBuacPosition}
                    options={memberPositions}
                    placeholder="Select BUAC Position"
                    disabled={loading}
                    icon={<HiBriefcase className="h-5 w-5" />}
                  />
                )}
              </>
            )}

            {role === "alumni" && (
              <>
                <CustomSelect
                  value={buacExDepartment}
                  onChange={(val) => {
                    setBuacExDepartment(val);
                    setPanelPosition("");
                    setBuacExPosition("");
                  }}
                  options={buacDepartments}
                  placeholder="Select Former Department"
                  disabled={loading}
                  icon={<HiSparkles className="h-5 w-5" />}
                />

                {!isPanelDepartment && buacExDepartment && (
                  <CustomSelect
                    value={buacExPosition}
                    onChange={setBuacExPosition}
                    options={alumniPositions}
                    placeholder="Select Former Position"
                    disabled={loading}
                    icon={<HiBriefcase className="h-5 w-5" />}
                  />
                )}
              </>
            )}

            {isPanelDepartment && (
              <CustomSelect
                value={panelPosition}
                onChange={setPanelPosition}
                options={panelOptions}
                placeholder="Select Panel Position"
                disabled={loading}
                icon={<HiBriefcase className="h-5 w-5 text-accent" />}
                className="[&>button]:border-accent/60"
              />
            )}

            <CustomSelect
              value={bloodGroup}
              onChange={setBloodGroup}
              options={bloodGroups}
              placeholder="Select Blood Group"
              disabled={loading}
              icon={<HiHeart className="h-5 w-5" />}
            />

            <div className="flex h-12 items-center justify-between rounded-xl border-2 border-white/15 bg-black/50 px-4 sm:h-13">
              <span className="text-xs text-white/80 sm:text-sm">
                Donate blood?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDonateBlood("yes")}
                  className={`cursor-pointer rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    donateBlood === "yes"
                      ? "bg-accent text-white"
                      : "bg-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => setDonateBlood("no")}
                  className={`cursor-pointer rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    donateBlood === "no"
                      ? "bg-accent text-white"
                      : "bg-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <AppInput
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              icon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer text-white/70 transition-colors hover:text-accent"
                >
                  {showPassword ? (
                    <HiEye className="h-5 w-5" />
                  ) : (
                    <HiEyeOff className="h-5 w-5" />
                  )}
                </button>
              }
            />

            <AppInput
              placeholder="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              icon={
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="cursor-pointer text-white/70 transition-colors hover:text-accent"
                >
                  {showConfirmPassword ? (
                    <HiEye className="h-5 w-5" />
                  ) : (
                    <HiEyeOff className="h-5 w-5" />
                  )}
                </button>
              }
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-xl border border-red-500/40 bg-red-500/15 p-3 text-center text-xs text-red-300 sm:text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mx-auto inline-flex cursor-pointer items-center justify-center rounded-xl bg-accent px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              ) : (
                <>
                  Create Account <HiArrowRight className="h-4 w-4" />
                </>
              )}
            </span>
          </button>

          <p className="text-center text-xs text-white/70">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-white underline hover:text-accent"
            >
              Sign in
            </Link>
          </p>

          <Link
            href="/"
            className="block text-center text-xs text-white/50 transition-colors hover:text-accent"
          >
            ← Back to Home
          </Link>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;