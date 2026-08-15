"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";
import axios, {
  AxiosError,
} from "axios";
import { motion } from "framer-motion";
import {
  HiAcademicCap,
  HiBriefcase,
  HiCalendar,
  HiHeart,
  HiLink,
  HiLockClosed,
  HiMail,
  HiSave,
  HiSparkles,
  HiTrash,
  HiUser,
  HiPhone,
} from "react-icons/hi";
import { FaTint } from "react-icons/fa";
import { useAuth } from "@/app/context/AuthProvider";
import CustomSelect from "@/app/components/ui/CustomSelect";
import PageLoader from "@/app/components/ui/PageLoader";

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

interface ProfileData {
  contact?: string;
  facebook?: string;
  varsityDepartment?: string;
  joinSemester?: string;
  buacDepartment?: string;
  buacPosition?: string;
  buacExDepartment?: string;
  buacExPosition?: string;
  panelPosition?: string;
  bloodGroup?: string;
  donateBlood?: string;
}

interface UserData {
  name: string;
  email: string;
  role:
    | "member"
    | "alumni"
    | "admin";
  profile: ProfileData;
  createdAt?: string;
}

const inputClass =
  "h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-[15px] text-text-secondary outline-none transition focus:border-accent placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-50 sm:h-13 sm:text-sm";

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        {icon}
        {label}
      </label>

      {children}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const {
    isLoggedIn,
    logout,
  } = useAuth();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    deleteConfirmation,
    setDeleteConfirmation,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [user, setUser] =
    useState<UserData | null>(
      null,
    );

  const [name, setName] =
    useState("");

  const [contact, setContact] =
    useState("");

  const [facebook, setFacebook] =
    useState("");

  const [
    varsityDepartment,
    setVarsityDepartment,
  ] = useState("");

  const [
    joinSemester,
    setJoinSemester,
  ] = useState("");

  const [
    buacDepartment,
    setBuacDepartment,
  ] = useState("");

  const [
    buacPosition,
    setBuacPosition,
  ] = useState("");

  const [
    buacExDepartment,
    setBuacExDepartment,
  ] = useState("");

  const [
    buacExPosition,
    setBuacExPosition,
  ] = useState("");

  const [
    panelPosition,
    setPanelPosition,
  ] = useState("");

  const [
    bloodGroup,
    setBloodGroup,
  ] = useState("");

  const [
    donateBlood,
    setDonateBlood,
  ] = useState<
    "yes" | "no" | "maybe"
  >("no");

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    const fetchProfile =
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await axios.get<{
              user: UserData;
            }>(
              "/api/auth/profile",
              {
                withCredentials:
                  true,
              },
            );

          if (cancelled) return;

          const data =
            response.data.user;

          setUser(data);

          setName(
            data.name || "",
          );

          setContact(
            data.profile
              ?.contact || "",
          );

          setFacebook(
            data.profile
              ?.facebook || "",
          );

          setVarsityDepartment(
            data.profile
              ?.varsityDepartment ||
              "",
          );

          setJoinSemester(
            data.profile
              ?.joinSemester || "",
          );

          setBuacDepartment(
            data.profile
              ?.buacDepartment ||
              "",
          );

          setBuacPosition(
            data.profile
              ?.buacPosition || "",
          );

          setBuacExDepartment(
            data.profile
              ?.buacExDepartment ||
              "",
          );

          setBuacExPosition(
            data.profile
              ?.buacExPosition || "",
          );

          setPanelPosition(
            data.profile
              ?.panelPosition || "",
          );

          setBloodGroup(
            data.profile
              ?.bloodGroup || "",
          );

          const storedInterest =
            data.profile
              ?.donateBlood || "no";

          setDonateBlood(
            storedInterest === "yes"
              ? "yes"
              : storedInterest ===
                    "maybe"
                ? "maybe"
                : "no",
          );
        } catch (requestError) {
          if (cancelled) return;

          console.error(
            "Failed to load profile:",
            requestError,
          );

          if (
            requestError instanceof
            AxiosError
          ) {
            const responseError =
              requestError.response
                ?.data as
                | {
                    error?: string;
                    code?: string;
                  }
                | undefined;

            setError(
              responseError?.error ||
                "Failed to load your profile.",
            );

            if (
              requestError.response
                ?.status === 401
            ) {
              setTimeout(() => {
                router.replace(
                  "/login",
                );
              }, 1200);
            }
          } else {
            setError(
              "Failed to load your profile.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, router]);

  const isMember =
    user?.role === "member";

  const isAlumni =
    user?.role === "alumni";

  const isAdmin =
    user?.role === "admin";

  const isPanel = isMember
    ? buacDepartment === "Panel"
    : buacExDepartment ===
      "Panel";

  const panelOptions =
    isMember
      ? memberPanelPositions
      : alumniPanelPositions;

  const handleSave = async () => {
    if (!user || isAdmin) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const profile: ProfileData = {
        contact,
        facebook,
        bloodGroup:
          bloodGroup ||
          "Unknown",
        donateBlood,
      };

      if (isMember) {
        profile.varsityDepartment =
          varsityDepartment;

        profile.joinSemester =
          joinSemester;

        profile.buacDepartment =
          buacDepartment;

        profile.buacPosition =
          isPanel
            ? ""
            : buacPosition;

        profile.panelPosition =
          isPanel
            ? panelPosition
            : "";
      }

      if (isAlumni) {
        profile.buacExDepartment =
          buacExDepartment;

        profile.buacExPosition =
          isPanel
            ? ""
            : buacExPosition;

        profile.panelPosition =
          isPanel
            ? panelPosition
            : "";
      }

      const payload: {
        name: string;
        profile: ProfileData;
        currentPassword?: string;
        newPassword?: string;
      } = {
        name,
        profile,
      };

      if (newPassword) {
        payload.currentPassword =
          currentPassword;

        payload.newPassword =
          newPassword;
      }

      const response =
        await axios.put(
          "/api/auth/profile",
          payload,
          {
            withCredentials: true,
          },
        );

      if (
        response.status === 200
      ) {
        setMessage(
          "Profile updated successfully.",
        );

        setCurrentPassword("");
        setNewPassword("");

        setUser((previous) =>
          previous
            ? {
                ...previous,
                name,
                profile,
              }
            : previous,
        );
      }
    } catch (requestError) {
      console.error(
        "Failed to update profile:",
        requestError,
      );

      if (
        requestError instanceof
        AxiosError
      ) {
        setError(
          requestError.response?.data
            ?.error ||
            "Failed to update your profile.",
        );
      } else {
        setError(
          "Failed to update your profile.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount =
    async () => {
      if (
        !user ||
        user.role === "admin"
      ) {
        return;
      }

      if (
        deleteConfirmation !==
        "DELETE"
      ) {
        setError(
          'Type "DELETE" to confirm account deletion.',
        );

        return;
      }

      setDeleting(true);
      setError("");
      setMessage("");

      try {
        const response =
          await axios.delete(
            "/api/auth/profile",
            {
              withCredentials: true,
            },
          );

        if (
          response.status === 200
        ) {
          setDeleteDialogOpen(false);

          /*
           * The DELETE route already clears
           * cookies. logout() also clears the
           * client AuthProvider state.
           */
          await logout();
        }
      } catch (requestError) {
        console.error(
          "Failed to delete account:",
          requestError,
        );

        if (
          requestError instanceof
          AxiosError
        ) {
          setError(
            requestError.response?.data
              ?.error ||
              "Failed to delete your account.",
          );
        } else {
          setError(
            "Failed to delete your account.",
          );
        }
      } finally {
        setDeleting(false);
      }
    };

  if (loading) {
    return (
      <PageLoader label="Loading your profile" />
    );
  }

  if (!user) {
    return (
      <main className="buac-gradient-bg flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-bebasNeue text-4xl tracking-wider text-text-secondary">
            Profile Not Available
          </h1>

          <p className="mt-3 text-sm text-text-muted">
            {error ||
              "Your profile could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/login")
            }
            className="mt-6 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="buac-gradient-bg min-h-screen px-4 py-20 font-poppins text-text-secondary sm:px-6 md:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.header
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-accent">
            My Account
          </p>

          <h1 className="font-bebasNeue text-5xl leading-none tracking-wider text-text-secondary sm:text-7xl">
            Profile
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-text-muted">
              {user.email}
            </span>

            <span
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase ${
                user.role === "admin"
                  ? "bg-red-500/20 text-red-400"
                  : user.role ===
                      "alumni"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-accent/20 text-accent"
              }`}
            >
              {user.role}
            </span>
          </div>
        </motion.header>

        {message && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-500">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <section className="rounded-3xl border border-border bg-surface/80 p-5 shadow-xl backdrop-blur-md sm:p-7">
            <h2 className="mb-6 font-bebasNeue text-3xl tracking-wide text-accent">
              Basic Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Full Name"
                icon={
                  <HiUser className="h-4 w-4" />
                }
              >
                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  disabled={
                    saving || isAdmin
                  }
                  className={inputClass}
                  placeholder="Your full name"
                />
              </Field>

              <Field
                label="Email"
                icon={
                  <HiMail className="h-4 w-4" />
                }
              >
                <input
                  value={user.email}
                  disabled
                  className={`${inputClass} cursor-not-allowed opacity-60`}
                />
              </Field>

              {!isAdmin && (
                <>
                  <Field
                    label="Contact Number"
                    icon={
                      <HiPhone className="h-4 w-4" />
                    }
                  >
                    <input
                      value={contact}
                      onChange={(event) =>
                        setContact(
                          event.target.value,
                        )
                      }
                      disabled={saving}
                      className={inputClass}
                      placeholder="01XXXXXXXXX"
                    />
                  </Field>

                  <Field
                    label="Facebook Profile"
                    icon={
                      <HiLink className="h-4 w-4" />
                    }
                  >
                    <input
                      value={facebook}
                      onChange={(event) =>
                        setFacebook(
                          event.target.value,
                        )
                      }
                      disabled={saving}
                      className={inputClass}
                      placeholder="https://facebook.com/..."
                    />
                  </Field>
                </>
              )}
            </div>
          </section>

          {!isAdmin && (
            <section className="rounded-3xl border border-border bg-surface/80 p-5 shadow-xl backdrop-blur-md sm:p-7">
              <h2 className="mb-6 font-bebasNeue text-3xl tracking-wide text-accent">
                BUAC Information
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {isMember && (
                  <>
                    <Field
                      label="Varsity Department"
                      icon={
                        <HiAcademicCap className="h-4 w-4" />
                      }
                    >
                      <input
                        value={
                          varsityDepartment
                        }
                        onChange={(event) =>
                          setVarsityDepartment(
                            event.target
                              .value,
                          )
                        }
                        disabled={saving}
                        className={
                          inputClass
                        }
                        placeholder="e.g. CSE"
                      />
                    </Field>

                    <Field
                      label="BRAC Joining Semester"
                      icon={
                        <HiCalendar className="h-4 w-4" />
                      }
                    >
                      <input
                        value={
                          joinSemester
                        }
                        onChange={(event) =>
                          setJoinSemester(
                            event.target
                              .value,
                          )
                        }
                        disabled={saving}
                        className={
                          inputClass
                        }
                        placeholder="e.g. Spring 2025"
                      />
                    </Field>

                    <Field
                      label="BUAC Department"
                      icon={
                        <HiSparkles className="h-4 w-4" />
                      }
                    >
                      <CustomSelect
                        variant="surface"
                        value={
                          buacDepartment
                        }
                        onChange={(
                          value,
                        ) => {
                          setBuacDepartment(
                            value,
                          );

                          setPanelPosition(
                            "",
                          );

                          setBuacPosition(
                            "",
                          );
                        }}
                        options={
                          buacDepartments
                        }
                        placeholder="Select BUAC Department"
                        disabled={saving}
                      />
                    </Field>

                    {!isPanel &&
                      buacDepartment && (
                        <Field
                          label="BUAC Position"
                          icon={
                            <HiBriefcase className="h-4 w-4" />
                          }
                        >
                          <CustomSelect
                            variant="surface"
                            value={
                              buacPosition
                            }
                            onChange={
                              setBuacPosition
                            }
                            options={
                              memberPositions
                            }
                            placeholder="Select BUAC Position"
                            disabled={
                              saving
                            }
                          />
                        </Field>
                      )}
                  </>
                )}

                {isAlumni && (
                  <>
                    <Field
                      label="Former BUAC Department"
                      icon={
                        <HiSparkles className="h-4 w-4" />
                      }
                    >
                      <CustomSelect
                        variant="surface"
                        value={
                          buacExDepartment
                        }
                        onChange={(
                          value,
                        ) => {
                          setBuacExDepartment(
                            value,
                          );

                          setPanelPosition(
                            "",
                          );

                          setBuacExPosition(
                            "",
                          );
                        }}
                        options={
                          buacDepartments
                        }
                        placeholder="Select Former Department"
                        disabled={saving}
                      />
                    </Field>

                    {!isPanel &&
                      buacExDepartment && (
                        <Field
                          label="Former BUAC Position"
                          icon={
                            <HiBriefcase className="h-4 w-4" />
                          }
                        >
                          <CustomSelect
                            variant="surface"
                            value={
                              buacExPosition
                            }
                            onChange={
                              setBuacExPosition
                            }
                            options={
                              alumniPositions
                            }
                            placeholder="Select Former Position"
                            disabled={
                              saving
                            }
                          />
                        </Field>
                      )}
                  </>
                )}

                {isPanel && (
                  <Field
                    label="Panel Position"
                    icon={
                      <HiBriefcase className="h-4 w-4" />
                    }
                  >
                    <CustomSelect
                      variant="surface"
                      value={panelPosition}
                      onChange={
                        setPanelPosition
                      }
                      options={panelOptions}
                      placeholder="Select Panel Position"
                      disabled={saving}
                    />
                  </Field>
                )}

                <Field
                  label="Blood Group"
                  icon={
                    <HiHeart className="h-4 w-4" />
                  }
                >
                  <CustomSelect
                    variant="surface"
                    value={bloodGroup}
                    onChange={
                      setBloodGroup
                    }
                    options={bloodGroups}
                    placeholder="Select Blood Group"
                    disabled={saving}
                  />
                </Field>

                <Field
                  label="Are you interested to donate blood?"
                  icon={
                    <FaTint className="h-4 w-4 text-red-500" />
                  }
                >
                  <div className="flex h-12 items-center gap-2 rounded-xl border border-input-border bg-input-bg px-3 sm:h-13">
                    {(
                      [
                        "yes",
                        "maybe",
                        "no",
                      ] as const
                    ).map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setDonateBlood(
                              option,
                            )
                          }
                          disabled={
                            saving
                          }
                          className={`flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition ${
                            donateBlood ===
                            option
                              ? option ===
                                "yes"
                                ? "bg-green-500 text-white"
                                : option ===
                                    "maybe"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-red-500 text-white"
                              : "bg-transparent text-text-muted hover:text-text-secondary"
                          }`}
                        >
                          {option === "yes"
                            ? "Yes"
                            : option ===
                                "maybe"
                              ? "Maybe"
                              : "No"}
                        </button>
                      ),
                    )}
                  </div>
                </Field>
              </div>
            </section>
          )}

          {!isAdmin && (
            <section className="rounded-3xl border border-border bg-surface/80 p-5 shadow-xl backdrop-blur-md sm:p-7">
              <h2 className="mb-2 font-bebasNeue text-3xl tracking-wide text-accent">
                Change Password
              </h2>

              <p className="mb-6 text-xs text-text-muted">
                Leave both fields empty
                if you do not want to
                change your password.
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Current Password"
                  icon={
                    <HiLockClosed className="h-4 w-4" />
                  }
                >
                  <input
                    type="password"
                    value={
                      currentPassword
                    }
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target
                          .value,
                      )
                    }
                    disabled={saving}
                    className={
                      inputClass
                    }
                    placeholder="Enter current password"
                  />
                </Field>

                <Field
                  label="New Password"
                  icon={
                    <HiLockClosed className="h-4 w-4" />
                  }
                >
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target
                          .value,
                      )
                    }
                    disabled={saving}
                    className={
                      inputClass
                    }
                    placeholder="At least 6 characters"
                  />
                </Field>
              </div>
            </section>
          )}

          {!isAdmin && (
            <div className="flex justify-end pb-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HiSave />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          )}

          {!isAdmin && (
            <section className="mb-8 rounded-3xl border border-red-500/30 bg-red-500/5 p-5 shadow-xl sm:p-7">
              <h2 className="font-bebasNeue text-3xl tracking-wide text-red-500">
                Danger Zone
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Deleting your account
                permanently removes your
                profile and login record
                from the database. This
                action cannot be undone.
              </p>

              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmation(
                    "",
                  );

                  setDeleteDialogOpen(
                    true,
                  );

                  setError("");
                }}
                disabled={deleting}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HiTrash />
                Delete My Account
              </button>
            </section>
          )}
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            className="w-full max-w-md rounded-3xl border border-red-500/30 bg-background p-6 shadow-2xl"
          >
            <h2 className="font-bebasNeue text-3xl tracking-wide text-red-500">
              Delete Account?
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Your profile and account
              information will be deleted
              permanently. Type{" "}
              <strong className="text-text-secondary">
                DELETE
              </strong>{" "}
              to confirm.
            </p>

            <input
              type="text"
              value={
                deleteConfirmation
              }
              onChange={(event) =>
                setDeleteConfirmation(
                  event.target.value,
                )
              }
              disabled={deleting}
              placeholder='Type "DELETE"'
              className="mt-5 w-full rounded-xl border border-red-500/30 bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-red-500 disabled:opacity-50"
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteDialogOpen(
                    false,
                  )
                }
                disabled={deleting}
                className="cursor-pointer rounded-xl border border-border px-5 py-3 text-sm font-semibold text-text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteAccount
                }
                disabled={
                  deleting ||
                  deleteConfirmation !==
                    "DELETE"
                }
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <HiTrash />

                {deleting
                  ? "Deleting..."
                  : "Delete Permanently"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}