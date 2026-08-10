"use client";

import React, {
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import axios, {
  AxiosError,
} from "axios";
import { motion } from "framer-motion";
import {
  HiAcademicCap,
  HiArrowRight,
  HiBriefcase,
  HiCalendar,
  HiEye,
  HiEyeOff,
  HiHeart,
  HiLink,
  HiMail,
  HiPhone,
  HiSparkles,
  HiUser,
} from "react-icons/hi";
import { FaMountain } from "react-icons/fa";
import { HiAcademicCap as HiAlumni } from "react-icons/hi2";
import GoogleAuthButton from "@/app/components/GoogleAuthButton";

type RoleType = "member" | "alumni";

interface AppInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

interface AppSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
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

const alumniPositions = [
  "Coordinator",
  "Assistant Director",
  "Director",
];

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

const AppInput = ({
  icon,
  className = "",
  ...rest
}: AppInputProps) => {
  const [mousePosition, setMousePosition] =
    useState({ x: 0 });

  const [isHovering, setIsHovering] =
    useState(false);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLInputElement>,
  ) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    setMousePosition({
      x: event.clientX - rect.left,
    });
  };

  return (
    <div className="relative w-full">
      <input
        {...rest}
        className={`relative z-10 h-13 w-full rounded-xl border border-border bg-surface/80 px-4 pr-11 font-light text-text-secondary outline-none transition-all duration-200 placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
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
        <div className="absolute top-1/2 right-3 z-20 -translate-y-1/2 text-text-muted">
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
  const [mousePosition, setMousePosition] =
    useState({ x: 0 });

  const [isHovering, setIsHovering] =
    useState(false);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLSelectElement>,
  ) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    setMousePosition({
      x: event.clientX - rect.left,
    });
  };

  return (
    <div className="relative w-full">
      <select
        {...rest}
        className={`relative z-10 h-13 w-full appearance-none rounded-xl border border-border bg-surface/80 px-4 pr-11 font-light text-text-secondary outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
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
        <div className="pointer-events-none absolute top-1/2 right-3 z-20 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
      )}
    </div>
  );
};

const Register = () => {
  const [role, setRole] =
    useState<RoleType>("member");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isCardHovering, setIsCardHovering] =
    useState(false);

  const [
    cardMousePosition,
    setCardMousePosition,
  ] = useState({
    x: 0,
    y: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [facebook, setFacebook] = useState("");

  const [bloodGroup, setBloodGroup] =
    useState("Unknown");

  const [donateBlood, setDonateBlood] =
    useState<"yes" | "no">("no");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [
    varsityDepartment,
    setVarsityDepartment,
  ] = useState("");

  const [joinSemester, setJoinSemester] =
    useState("");

  const [buacDepartment, setBuacDepartment] =
    useState("Creative");

  const [buacPosition, setBuacPosition] =
    useState("General Member");

  const [
    buacExDepartment,
    setBuacExDepartment,
  ] = useState("Creative");

  const [buacExPosition, setBuacExPosition] =
    useState("Coordinator");

  const [panelPosition, setPanelPosition] =
    useState("President");

  const isPanelDepartment = useMemo(() => {
    if (role === "member") {
      return buacDepartment === "Panel";
    }

    return buacExDepartment === "Panel";
  }, [
    role,
    buacDepartment,
    buacExDepartment,
  ]);

  const panelOptions =
    role === "member"
      ? memberPanelPositions
      : alumniPanelPositions;

  const handleCardMouseMove = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const section =
      event.currentTarget.getBoundingClientRect();

    setCardMousePosition({
      x: event.clientX - section.left,
      y: event.clientY - section.top,
    });
  };

  const validate = () => {
    if (
      !name ||
      !email ||
      !contact ||
      !facebook ||
      !password ||
      !confirmPassword
    ) {
      return "Please fill in all required fields.";
    }

    if (role === "member") {
      if (
        !email
          .trim()
          .toLowerCase()
          .endsWith("@g.bracu.ac.bd")
      ) {
        return "Members must use a valid BRACU G Suite email.";
      }

      if (
        !varsityDepartment ||
        !joinSemester
      ) {
        return "Please provide varsity department and BRAC joining semester.";
      }
    }

    if (role === "alumni") {
      if (
        !email
          .trim()
          .toLowerCase()
          .endsWith("@gmail.com")
      ) {
        return "Alumni must use a Gmail address.";
      }
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

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
            buacPosition: isPanelDepartment
              ? ""
              : buacPosition,
            panelPosition: isPanelDepartment
              ? panelPosition
              : "",
            bloodGroup,
            donateBlood,
            facebook,
          }
        : {
            contact,
            facebook,
            buacExDepartment,
            buacExPosition: isPanelDepartment
              ? ""
              : buacExPosition,
            panelPosition: isPanelDepartment
              ? panelPosition
              : "",
            bloodGroup,
            donateBlood,
          };

    try {
      const response = await axios.post(
        "/api/auth/register",
        {
          name,
          email: email.trim().toLowerCase(),
          password,
          role,
          profile,
        },
      );

      if (response.status === 201) {
        window.location.href = "/";
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
            "Registration failed.",
        );
      } else {
        setError(
          "An unexpected error occurred.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const changeRole = (nextRole: RoleType) => {
    setRole(nextRole);
    setError("");
  };

  return (
    <main className="auth-shell page-shell relative -mt-16 flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[42vh] w-[88vw] -translate-x-1/2 rounded-b-full bg-accent/15 blur-[95px]" />

      <div className="pointer-events-none absolute right-0 bottom-0 h-[36vh] w-[36vw] rounded-tl-full bg-accent/10 blur-[85px]" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.65,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface/75 shadow-2xl backdrop-blur-2xl"
        onMouseMove={handleCardMouseMove}
        onMouseEnter={() =>
          setIsCardHovering(true)
        }
        onMouseLeave={() =>
          setIsCardHovering(false)
        }
      >
        <div
          className={`pointer-events-none absolute h-[600px] w-[600px] rounded-full bg-gradient-to-r from-accent/25 via-orange-300/10 to-transparent blur-3xl transition-opacity duration-200 ${
            isCardHovering
              ? "opacity-100"
              : "opacity-0"
          }`}
          style={{
            transform: `translate(${
              cardMousePosition.x - 300
            }px, ${cardMousePosition.y - 300}px)`,
            transition:
              "transform 0.1s ease-out",
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
              priority
            />
          </Link>

          <div>
            <h1 className="font-bebasNeue text-6xl tracking-wider text-text-secondary">
              Create Account
            </h1>

            <p className="mt-1 text-xs text-text-muted">
              Register as a BUAC member or alumni.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <GoogleAuthButton mode="register" />

            <span className="text-xs text-text-muted">
              or fill the form below
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => changeRole("member")}
              disabled={loading}
              className={`cursor-pointer rounded-xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                role === "member"
                  ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
                  : "border-border bg-surface/70 text-text-muted hover:border-accent/50 hover:text-text-secondary"
              }`}
            >
              <FaMountain className="mb-1 text-lg" />

              <div className="text-sm font-semibold">
                Member
              </div>

              <div className="text-xs opacity-70">
                Current BRACU student
              </div>
            </button>

            <button
              type="button"
              onClick={() => changeRole("alumni")}
              disabled={loading}
              className={`cursor-pointer rounded-xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                role === "alumni"
                  ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "border-border bg-surface/70 text-text-muted hover:border-blue-500/50 hover:text-text-secondary"
              }`}
            >
              <HiAlumni className="mb-1 text-xl" />

              <div className="text-sm font-semibold">
                Alumni
              </div>

              <div className="text-xs opacity-70">
                Former BUAC member
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AppInput
              placeholder="Full Name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={loading}
              icon={<HiUser className="h-5 w-5" />}
            />

            <AppInput
              placeholder={
                role === "member"
                  ? "G Suite Email"
                  : "Gmail Address"
              }
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={loading}
              icon={<HiMail className="h-5 w-5" />}
            />

            <AppInput
              placeholder="Contact Number"
              value={contact}
              onChange={(event) =>
                setContact(event.target.value)
              }
              disabled={loading}
              icon={<HiPhone className="h-5 w-5" />}
            />

            <AppInput
              placeholder="Facebook ID Link"
              value={facebook}
              onChange={(event) =>
                setFacebook(event.target.value)
              }
              disabled={loading}
              icon={<HiLink className="h-5 w-5" />}
            />

            {role === "member" && (
              <>
                <AppInput
                  placeholder="Varsity Department"
                  value={varsityDepartment}
                  onChange={(event) =>
                    setVarsityDepartment(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  icon={
                    <HiAcademicCap className="h-5 w-5" />
                  }
                />

                <AppInput
                  placeholder="BRAC Joining Semester"
                  value={joinSemester}
                  onChange={(event) =>
                    setJoinSemester(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  icon={
                    <HiCalendar className="h-5 w-5" />
                  }
                />

                <AppSelect
                  value={buacDepartment}
                  onChange={(event) => {
                    setBuacDepartment(
                      event.target.value,
                    );

                    if (
                      event.target.value === "Panel"
                    ) {
                      setPanelPosition("President");
                    }
                  }}
                  disabled={loading}
                  icon={
                    <HiSparkles className="h-5 w-5" />
                  }
                >
                  {buacDepartments.map((department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  ))}
                </AppSelect>

                {!isPanelDepartment && (
                  <AppSelect
                    value={buacPosition}
                    onChange={(event) =>
                      setBuacPosition(
                        event.target.value,
                      )
                    }
                    disabled={loading}
                    icon={
                      <HiBriefcase className="h-5 w-5" />
                    }
                  >
                    {memberPositions.map((position) => (
                      <option
                        key={position}
                        value={position}
                      >
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
                  onChange={(event) => {
                    setBuacExDepartment(
                      event.target.value,
                    );

                    if (
                      event.target.value === "Panel"
                    ) {
                      setPanelPosition("President");
                    }
                  }}
                  disabled={loading}
                  icon={
                    <HiSparkles className="h-5 w-5" />
                  }
                >
                  {buacDepartments.map((department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  ))}
                </AppSelect>

                {!isPanelDepartment && (
                  <AppSelect
                    value={buacExPosition}
                    onChange={(event) =>
                      setBuacExPosition(
                        event.target.value,
                      )
                    }
                    disabled={loading}
                    icon={
                      <HiBriefcase className="h-5 w-5" />
                    }
                  >
                    {alumniPositions.map((position) => (
                      <option
                        key={position}
                        value={position}
                      >
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
                onChange={(event) =>
                  setPanelPosition(
                    event.target.value,
                  )
                }
                disabled={loading}
                icon={
                  <HiBriefcase className="h-5 w-5 text-accent" />
                }
                className="border-accent/40"
              >
                {panelOptions.map((position) => (
                  <option
                    key={position}
                    value={position}
                  >
                    {position}
                  </option>
                ))}
              </AppSelect>
            )}

            <AppSelect
              value={bloodGroup}
              onChange={(event) =>
                setBloodGroup(event.target.value)
              }
              disabled={loading}
              icon={<HiHeart className="h-5 w-5" />}
            >
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </AppSelect>

            <div className="flex items-center justify-between rounded-xl border border-border bg-surface/80 px-4">
              <span className="text-sm text-text-muted">
                Donate blood?
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDonateBlood("yes")}
                  disabled={loading}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    donateBlood === "yes"
                      ? "bg-accent text-white"
                      : "bg-text-muted/10 text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => setDonateBlood("no")}
                  disabled={loading}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    donateBlood === "no"
                      ? "bg-accent text-white"
                      : "bg-text-muted/10 text-text-muted hover:text-text-secondary"
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
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={loading}
              icon={
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
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
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              disabled={loading}
              icon={
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current,
                    )
                  }
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
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500"
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
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <HiArrowRight className="h-4 w-4" />
                </>
              )}
            </span>
          </button>

          <p className="text-center text-xs text-text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-text-secondary transition hover:text-accent"
            >
              Sign in
            </Link>
          </p>

          <Link
            href="/"
            className="text-xs text-text-muted transition-colors hover:text-accent"
          >
            ← Back to Home
          </Link>
        </form>
      </motion.div>
    </main>
  );
};

export default Register;