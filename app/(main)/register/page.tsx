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
import GoogleAuthButton from "@/app/components/GoogleAuthButton";

type RoleType = "member" | "alumni";

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

interface AppSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
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
  "Unknown",
];

const AppInput = ({ icon, className = "", ...rest }: AppInputProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left });
  };

  return (
    <div className="relative w-full">
      <input
        className={`peer relative z-10 h-13 w-full rounded-xl border-2 border-white/12 bg-black/35 px-4 pr-11 font-light text-white outline-none transition-all duration-200 placeholder:text-white/35 focus:border-accent/60 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        {...rest}
      />

      {isHovering && (
        <>
          <div
            className="pointer-events-none absolute top-0 left-0 right-0 z-20 h-[2px] rounded-t-xl"
            style={{
              background: `radial-gradient(40px circle at ${mousePosition.x}px 0px, var(--color-accent) 0%, transparent 70%)`,
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[2px] rounded-b-xl"
            style={{
              background: `radial-gradient(40px circle at ${mousePosition.x}px 2px, var(--color-accent) 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      {icon && (
        <div className="absolute right-3 top-1/2 z-20 -translate-y-1/2 text-white/50">
          {icon}
        </div>
      )}
    </div>
  );
};

const AppSelect = ({
  icon,
  className = "",
  children,
  ...rest
}: AppSelectProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLSelectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left });
  };

  return (
    <div className="relative w-full">
      <select
        className={`peer relative z-10 h-13 w-full appearance-none rounded-xl border-2 border-white/12 bg-black/35 px-4 pr-11 font-light text-white outline-none transition-all duration-200 focus:border-accent/60 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        {...rest}
      >
        {children}
      </select>

      {isHovering && (
        <>
          <div
            className="pointer-events-none absolute top-0 left-0 right-0 z-20 h-[2px] rounded-t-xl"
            style={{
              background: `radial-gradient(40px circle at ${mousePosition.x}px 0px, var(--color-accent) 0%, transparent 70%)`,
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[2px] rounded-b-xl"
            style={{
              background: `radial-gradient(40px circle at ${mousePosition.x}px 2px, var(--color-accent) 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      {icon && (
        <div className="absolute right-3 top-1/2 z-20 -translate-y-1/2 text-white/50">
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
  const [isCardHovering, setIsCardHovering] = useState(false);
  const [cardMousePosition, setCardMousePosition] = useState({ x: 0, y: 0 });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [facebook, setFacebook] = useState("");
  const [bloodGroup, setBloodGroup] = useState("Unknown");
  const [donateBlood, setDonateBlood] = useState<"yes" | "no">("no");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [varsityDepartment, setVarsityDepartment] = useState("");
  const [joinSemester, setJoinSemester] = useState("");

  const [buacDepartment, setBuacDepartment] = useState("Creative");
  const [buacPosition, setBuacPosition] = useState("General Member");

  const [buacExDepartment, setBuacExDepartment] = useState("Creative");
  const [buacExPosition, setBuacExPosition] = useState("Coordinator");

  const [panelPosition, setPanelPosition] = useState("President");

  const isPanelDepartment = useMemo(() => {
    return role === "member"
      ? buacDepartment === "Panel"
      : buacExDepartment === "Panel";
  }, [role, buacDepartment, buacExDepartment]);

  const panelOptions =
    role === "member" ? memberPanelPositions : alumniPanelPositions;

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const section = e.currentTarget.getBoundingClientRect();

    setCardMousePosition({
      x: e.clientX - section.left,
      y: e.clientY - section.top,
    });
  };

  const validate = () => {
    if (!name || !email || !contact || !facebook || !password || !confirmPassword) {
      return "Please fill in all required fields";
    }

    if (role === "member") {
      if (!email.toLowerCase().endsWith("@g.bracu.ac.bd")) {
        return "Members must use a valid BRACU G Suite email";
      }

      if (!varsityDepartment || !joinSemester) {
        return "Please provide varsity department and BRAC joining semester";
      }
    }

    if (role === "alumni") {
      if (!email.toLowerCase().endsWith("@gmail.com")) {
        return "Alumni must use a Gmail address";
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
            bloodGroup,
            donateBlood,
            facebook,
          }
        : {
            contact,
            facebook,
            buacExDepartment,
            buacExPosition: isPanelDepartment ? "" : buacExPosition,
            panelPosition: isPanelDepartment ? panelPosition : "",
            bloodGroup,
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
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative -mt-16 flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-background to-black" />
      <div className="absolute top-0 left-1/2 h-[50vh] w-[90vw] -translate-x-1/2 rounded-b-full bg-accent/20 blur-[90px]" />
      <div className="absolute bottom-0 right-0 h-[40vh] w-[40vw] rounded-tl-full bg-accent/10 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-2xl"
        onMouseMove={handleCardMouseMove}
        onMouseEnter={() => setIsCardHovering(true)}
        onMouseLeave={() => setIsCardHovering(false)}
      >
        <div
          className={`pointer-events-none absolute h-[600px] w-[600px] rounded-full bg-gradient-to-r from-accent/30 via-orange-300/20 to-white/10 blur-3xl transition-opacity duration-200 ${
            isCardHovering ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `translate(${cardMousePosition.x - 300}px, ${
              cardMousePosition.y - 300
            }px)`,
            transition: "transform 0.1s ease-out",
          }}
        />

        <form
          className="relative z-10 grid gap-5 px-6 py-10 text-center md:px-12"
          onSubmit={handleSubmit}
        >
          <Link href="/" className="mx-auto block">
            <Image
              src="/assets/logos/buac.webp"
              alt="BUAC Logo"
              width={62}
              height={62}
              className="mx-auto object-contain"
            />
          </Link>

          <div>
            <h1 className="font-bebasNeue text-6xl tracking-wider text-white">
              Create Account
            </h1>

            <p className="mt-1 text-xs text-white/55">
              Register as BUAC member or alumni
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <GoogleAuthButton mode="register" />
            <span className="text-xs text-white/40">or fill the form below</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setRole("member");
                setError("");
              }}
              className={`rounded-xl border px-4 py-3 text-left transition-all cursor-pointer ${
                role === "member"
                  ? "border-accent bg-accent text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-accent/50 hover:text-white"
              }`}
            >
              <FaMountain className="mb-1 text-lg" />
              <div className="text-sm font-semibold">Member</div>
              <div className="text-xs opacity-70">Current BRACU student</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("alumni");
                setError("");
              }}
              className={`rounded-xl border px-4 py-3 text-left transition-all cursor-pointer ${
                role === "alumni"
                  ? "border-blue-400 bg-blue-500/80 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-blue-400/50 hover:text-white"
              }`}
            >
              <HiAlumni className="mb-1 text-xl" />
              <div className="text-sm font-semibold">Alumni</div>
              <div className="text-xs opacity-70">Former BUAC member</div>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AppInput
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              icon={<HiUser className="h-5 w-5" />}
            />

            <AppInput
              placeholder={role === "member" ? "G Suite Email" : "Gmail Address"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              icon={<HiMail className="h-5 w-5" />}
            />

            <AppInput
              placeholder="Contact Number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={loading}
              icon={<HiPhone className="h-5 w-5" />}
            />

            <AppInput
              placeholder="Facebook ID Link"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              disabled={loading}
              icon={<HiLink className="h-5 w-5" />}
            />

            {role === "member" && (
              <>
                <AppInput
                  placeholder="Varsity Department"
                  value={varsityDepartment}
                  onChange={(e) => setVarsityDepartment(e.target.value)}
                  disabled={loading}
                  icon={<HiAcademicCap className="h-5 w-5" />}
                />

                <AppInput
                  placeholder="BRAC Joining Semester"
                  value={joinSemester}
                  onChange={(e) => setJoinSemester(e.target.value)}
                  disabled={loading}
                  icon={<HiCalendar className="h-5 w-5" />}
                />

                <AppSelect
                  value={buacDepartment}
                  onChange={(e) => {
                    setBuacDepartment(e.target.value);

                    if (e.target.value === "Panel") {
                      setPanelPosition("President");
                    }
                  }}
                  disabled={loading}
                  icon={<HiSparkles className="h-5 w-5" />}
                >
                  {buacDepartments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </AppSelect>

                {!isPanelDepartment && (
                  <AppSelect
                    value={buacPosition}
                    onChange={(e) => setBuacPosition(e.target.value)}
                    disabled={loading}
                    icon={<HiBriefcase className="h-5 w-5" />}
                  >
                    {memberPositions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </AppSelect>
                )}
              </>
            )}

            {role === "alumni" && (
              <>
                <AppSelect
                  value={buacExDepartment}
                  onChange={(e) => {
                    setBuacExDepartment(e.target.value);

                    if (e.target.value === "Panel") {
                      setPanelPosition("President");
                    }
                  }}
                  disabled={loading}
                  icon={<HiSparkles className="h-5 w-5" />}
                >
                  {buacDepartments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </AppSelect>

                {!isPanelDepartment && (
                  <AppSelect
                    value={buacExPosition}
                    onChange={(e) => setBuacExPosition(e.target.value)}
                    disabled={loading}
                    icon={<HiBriefcase className="h-5 w-5" />}
                  >
                    {alumniPositions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </AppSelect>
                )}
              </>
            )}

            {isPanelDepartment && (
              <AppSelect
                value={panelPosition}
                onChange={(e) => setPanelPosition(e.target.value)}
                disabled={loading}
                icon={<HiBriefcase className="h-5 w-5 text-accent" />}
                className="border-accent/40"
              >
                {panelOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </AppSelect>
            )}

            <AppSelect
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              disabled={loading}
              icon={<HiHeart className="h-5 w-5" />}
            >
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </AppSelect>

            <div className="flex items-center justify-between rounded-xl border-2 border-white/12 bg-black/35 px-4">
              <span className="text-sm text-white/65">Donate blood?</span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDonateBlood("yes")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    donateBlood === "yes"
                      ? "bg-accent text-white"
                      : "bg-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => setDonateBlood("no")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    donateBlood === "no"
                      ? "bg-accent text-white"
                      : "bg-white/10 text-white/50 hover:text-white"
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
                  className="cursor-pointer transition-colors hover:text-accent"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer transition-colors hover:text-accent"
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
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mx-auto inline-flex cursor-pointer items-center justify-center rounded-xl bg-accent px-8 py-3 text-sm font-bold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
              ) : (
                <>
                  Create Account <HiArrowRight className="h-4 w-4" />
                </>
              )}
            </span>
          </button>

          <p className="text-center text-xs text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-white hover:text-accent">
              Sign in
            </Link>
          </p>

          <Link
            href="/"
            className="text-xs text-white/40 hover:text-accent transition-colors"
          >
            ← Back to Home
          </Link>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;