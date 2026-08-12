"use client";

import { useRef, useState, useCallback, FormEvent } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { motion } from "framer-motion";
import { fadeInLeft, fadeInRight } from "@/lib/animations";

gsap.registerPlugin(ScrollTrigger);

interface Department {
  id: string;
  name: string;
  description: string;
  image: string;
  number: string;
}

export function DepartmentSections({
  departments,
}: {
  departments: Department[];
}) {
  const { auth } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [editing, setEditing] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    imageFile: null as File | null,
  });

  useGSAP(
    () => {
      if (!departments || departments.length === 0) return;

      const ctx = gsap.context(() => {
        const sections =
          containerRef.current?.querySelectorAll(".dept-section");

        sections?.forEach((section) => {
          const horizontalText = section.querySelector(".horizontal-text");
          const image = section.querySelector(".dept-image-wrapper");
          const content = section.querySelector(".dept-content");

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top center",
              toggleActions: "play none none reverse",
            },
          });

          tl.fromTo(
            horizontalText,
            { xPercent: -60, opacity: 0 },
            { xPercent: 0, opacity: 1, duration: 1.2, ease: "power4.out" },
            "-=1",
          )
            .fromTo(
              image,
              { scale: 0.9, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" },
              "-=0.8",
            )
            .fromTo(
              content,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
              "-=0.6",
            );
        });
      }, containerRef);

      return () => ctx.revert();
    },
    { dependencies: [departments] },
  );

  const openEdit = useCallback((department: Department) => {
    setEditing(department);
    setForm({
      name: department.name,
      description: department.description,
      imageFile: null,
    });
  }, []);

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await axios.post("/api/content/upload", formData, {
      withCredentials: true,
    });

    if (uploadRes.status !== 200 || !uploadRes.data.url) {
      throw new Error("Upload failed");
    }

    return uploadRes.data.url as string;
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (!editing) return;

    setSaving(true);

    try {
      let imageUrl = editing.image;

      if (form.imageFile) {
        imageUrl = await uploadFile(form.imageFile);
      }

      const updatedDepartments = departments.map((dept) =>
        dept.id === editing.id
          ? {
              ...dept,
              name: form.name,
              description: form.description,
              image: imageUrl,
            }
          : dept,
      );

      await axios.put("/api/content/departments", updatedDepartments, {
        withCredentials: true,
      });

      closeEdit();
      window.location.reload();
    } catch (err) {
      console.error("Error updating department", err);
      alert("Error updating department");
    } finally {
      setSaving(false);
    }
  };

  if (!departments || departments.length === 0) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-text-muted">No departments available.</p>
      </section>
    );
  }

  return (
    <>
      <div ref={containerRef} className="relative overflow-x-hidden">
        {departments.map((department, index) => {
          const isEven = index % 2 === 0;

          return (
            <section
              key={department.id || index}
              id={department.id}
              className="dept-section relative min-h-screen overflow-hidden py-16 sm:py-20"
            >
              <div className="pointer-events-none absolute bottom-2 left-1/2 z-0 w-screen -translate-x-1/2 select-none sm:bottom-4 md:-bottom-12">
                <div className="horizontal-text w-max">
                  <span className="font-bebasNeue text-[18vw] leading-none tracking-tight whitespace-nowrap text-accent/10 sm:text-[16vw] md:text-[20vw]">
                    {department.name}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {department.name}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {department.name}
                  </span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`floating-number absolute top-6 z-20 flex items-center justify-between gap-3 sm:top-10 md:top-16 ${
                  isEven
                    ? "right-4 sm:right-8 lg:right-20"
                    : "left-4 sm:left-8 lg:left-20"
                }`}
              >
                <span className="font-mono text-4xl leading-none text-accent/15 sm:text-5xl lg:text-6xl">
                  {department.number}
                </span>

                {auth && (
                  <button
                    onClick={() => openEdit(department)}
                    aria-label={`Edit ${department.name}`}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-2 border-accent bg-accent p-2 font-medium text-white transition-all hover:bg-transparent hover:text-accent sm:gap-2 sm:px-4 sm:py-2"
                  >
                    <HiOutlinePencilAlt className="text-lg sm:text-xl" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
              </motion.div>

              <div className="relative z-10 mx-auto h-full w-full max-w-7xl px-4 sm:px-6 md:px-12 lg:px-20">
                <div
                  className={`flex h-full flex-col items-center justify-center gap-6 pt-16 sm:gap-8 sm:pt-20 lg:gap-16 lg:pt-0 ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={isEven ? fadeInLeft : fadeInRight}
                    className="dept-image-wrapper relative w-full lg:w-1/2"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-surface-secondary shadow-2xl sm:rounded-3xl">
                      {department.image ? (
                        <Image
                          src={department.image}
                          alt={`${department.name} Department`}
                          width={700}
                          height={700}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="h-auto w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-[240px] w-full items-center justify-center bg-accent/10 sm:h-[360px]">
                          <span className="text-text-muted">No Image</span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={isEven ? fadeInRight : fadeInLeft}
                    className={`dept-content w-full lg:w-1/2 ${
                      isEven ? "lg:pl-6" : "lg:pr-6"
                    }`}
                  >
                    <div className="mb-4 flex items-center gap-4 sm:mb-6">
                      <span className="h-px w-10 bg-accent sm:w-12" />
                    </div>

                    <h2 className="mb-4 font-bebasNeue text-[2.5rem] leading-[0.9] tracking-tight text-text-secondary sm:mb-6 sm:text-6xl lg:text-7xl">
                      {department.name}
                    </h2>

                    <p className="w-full text-sm leading-relaxed text-text-muted sm:text-base md:text-lg">
                      {department.description}
                    </p>
                  </motion.div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {editing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4"
        >
          <motion.form
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 border-accent/20 bg-surface p-5 shadow-2xl sm:p-8"
          >
            <div className="mb-5 flex items-center justify-between gap-3 border-b-2 border-accent/20 pb-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-text-secondary sm:text-2xl">
                <HiOutlinePencilAlt className="shrink-0 text-2xl text-accent sm:text-3xl" />
                <span className="truncate">Edit {editing.name}</span>
              </h3>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="shrink-0 cursor-pointer rounded-lg bg-surface-secondary px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-border disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <label className="mb-2 block text-sm font-bold text-text-secondary">
              Name
            </label>

            <input
              className="mb-5 w-full rounded-lg border-2 border-border bg-input-bg p-3 font-semibold text-text-secondary transition focus:border-accent focus:outline-none disabled:opacity-50"
              value={form.name}
              disabled={saving}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />

            <label className="mb-2 block text-sm font-bold text-text-secondary">
              Description
            </label>

            <textarea
              className="mb-5 w-full rounded-lg border-2 border-border bg-input-bg p-3 text-text-secondary transition focus:border-accent focus:outline-none disabled:opacity-50"
              value={form.description}
              rows={6}
              disabled={saving}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
            />

            <label className="mb-2 block text-sm font-bold text-text-secondary">
              Replace Department Image
            </label>

            <input
              type="file"
              accept="image/*"
              disabled={saving}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  imageFile: e.target.files?.[0] ?? null,
                }))
              }
              className="mb-6 w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent/90 disabled:opacity-50"
            />

            <div className="flex flex-col-reverse gap-3 border-t-2 border-accent/20 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="cursor-pointer rounded-lg bg-surface-secondary px-6 py-3 font-medium text-text-secondary transition hover:bg-border disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </>
  );
}