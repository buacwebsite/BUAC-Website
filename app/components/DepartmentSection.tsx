"use client";

import { useRef, useState, useCallback, FormEvent } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import { IoIosArrowRoundForward } from "react-icons/io";
import { HiOutlinePencilAlt } from "react-icons/hi";

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
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageFile: null as File | null,
  });

  useGSAP(() => {
    if (!departments || departments.length === 0) return;

    const ctx = gsap.context(() => {
      const sections = containerRef.current?.querySelectorAll(".dept-section");

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        snap: {
          snapTo: 1 / (departments.length - 1),
          duration: { min: 0.6, max: 1.2 },
          delay: 0.1,
          ease: "power2.inOut",
        },
      });

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
          { xPercent: -100, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 1.2, ease: "power4.out" },
          "-=1",
        )
          .fromTo(
            image,
            { scale: 0.8, opacity: 0, rotate: -5 },
            {
              scale: 1,
              opacity: 1,
              rotate: 0,
              duration: 1,
              ease: "power3.out",
            },
            "-=0.8",
          )
          .fromTo(
            content,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
            "-=0.6",
          );

        gsap.to(horizontalText, {
          xPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
            // markers: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [departments]);

  const openEdit = useCallback((department: (typeof departments)[0]) => {
    setEditing(department);
    setForm({
      name: department.name,
      description: department.description,
      imageFile: null,
    });
  }, []);

  const closeEdit = () => setEditing(null);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!editing) return;

    try {
      let imageUrl = editing.image;
      if (form.imageFile) {
        const formData = new FormData();
        formData.append("file", form.imageFile);
        const uploadRes = await axios.post("/api/content/upload", formData);
        if (uploadRes.status !== 200 || !uploadRes.data.url) {
          console.error("Image upload failed");
          alert("Image upload failed");
          return;
        }
        imageUrl = uploadRes.data.url;
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
      alert("Department updated successfully");
      closeEdit();
      window.location.reload();
    } catch (err) {
      console.error("Error updating department", err);
      alert("Error updating department");
    }
  };

  return (
    <>
      <div ref={containerRef} className="relative overflow-x-hidden">
        {departments.map((department, index) => {
          const isEven = index % 2 === 0;
          return (
            <section
              key={index}
              id={department.id}
              className="dept-section relative h-screen py-16 overflow-hidden"
            >
              <div className="absolute bottom-4 md:-bottom-12 left-1/2 -translate-x-1/2 w-screen pointer-events-none select-none z-0">
                <div className="horizontal-text w-max">
                  <span className="font-bebasNeue text-[12vw] md:text-[20vw] text-accent/10 whitespace-nowrap tracking-tight leading-none">
                    {department.name}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {department.name}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {department.name}
                  </span>
                </div>
              </div>

              <div
                className={`floating-number absolute top-8 md:top-16 flex gap-4 justify-between items-center z-11 ${
                  isEven
                    ? "right-8 md:right-20 lg:right-32"
                    : "left-8 md:left-20 lg:left-32"
                } z-10`}
              >
                <span className="font-mono text-8xl md:text-xl lg:text-6xl text-accent/10 leading-none">
                  {department.number}
                </span>
                {auth && window.innerWidth > 1024 && (
                  <button
                    onClick={() => openEdit(department)}
                    aria-label={`Edit ${department.name}`}
                    title={`Edit ${department.name}`}
                    className="flex items-center justify-center gap-0 sm:gap-2 font-medium rounded-full border-2 border-accent transition-all duration-300 cursor-pointer p-2 sm:px-4 sm:py-2 bg-accent text-white hover:bg-transparent hover:text-accent"
                  >
                    <HiOutlinePencilAlt className="text-lg sm:text-xl" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
              </div>

              <div className="relative z-10 h-full w-full max-w-8xl mx-auto px-6 md:px-12 lg:px-20">
                <div
                  className={`flex flex-col h-full ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  } items-center gap-12 lg:gap-20`}
                >
                  <div className="dept-image-wrapper relative w-full lg:w-1/2">
                    <div className="relative">
                      <div className="relative overflow-hidden bg-secondary">
                        <Image
                          src={department.image}
                          alt={`${department.name} Department`}
                          width={600}
                          height={600}
                          className="object-cover"
                        />
                      </div>
                      {auth && window.innerWidth < 1024 && (
                        <button
                          onClick={() => openEdit(department)}
                          aria-label={`Edit ${department.name}`}
                          title={`Edit ${department.name}`}
                          className="flex mt-2 items-center justify-end absolute right-0 gap-2 font-medium rounded-full border-2 border-accent transition-all duration-300 cursor-pointer p-2 px-4 py-2 bg-accent text-white hover:bg-transparent hover:text-accent"
                        >
                          <HiOutlinePencilAlt className="text-lg sm:text-xl" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    className={`dept-content w-full lg:w-3/4 ${isEven ? "lg:pl-8" : "lg:pr-8"}`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <span className="w-12 h-px bg-accent" />
                      {/* <span className="text-accent font-mono text-xs tracking-[0.3em] uppercase">
                    Department {department.number}
                    </span> */}
                    </div>

                    <div className="flex flex-row items-start justify-between">
                      <h2 className="font-bebasNeue text-5xl md:text-7xl lg:text-8xl text-text-secondary tracking-tight mb-2 md:mb-8 leading-[0.9]">
                        {/* {department.name.split(" ").map((word, i) => (
                            <span key={i} className="block">
                                {word}
                            </span>
                        ))} */}
                        {department.name}
                      </h2>
                      {/* {window.innerWidth < 1024 && (
                        <div
                          className="group flex items-center gap-4 cursor-pointer"
                          onClick={() =>
                            alert(
                              "Apatoto kichu nai pore chaile page add kore dewa jay",
                            )
                          }
                        >
                          <div className="relative w-8 h-8 md:w-12 md:h-12 border border-text-muted/20 flex items-center justify-center group-hover:border-accent transition-colors duration-300">
                            <div
                              className={`text-xl md:text-3xl text-text-muted group-hover:text-accent transition-all duration-300 group-hover:translate-x-1`}
                            >
                              <IoIosArrowRoundForward />
                            </div>
                          </div>
                          <span className="text-text-muted text-xs md:text-sm font-medium tracking-wide uppercase group-hover:text-accent transition-colors duration-300 whitespace-nowrap">
                            Meet the Team
                          </span>
                        </div>
                      )} */}
                    </div>

                    <p className="text-text-muted text-sm md:text-xl leading-tight md:leading-relaxed text-justify w-full mb-10">
                      {department.description}
                    </p>

                    {/* Meet the Team Button (might delete later) */}
                    {/* {window.innerWidth >= 1024 && (
                      <div
                        className="group flex items-center gap-4 cursor-pointer"
                        onClick={() =>
                          alert(
                            "Apatoto kichu nai pore chaile page add kore dewa jay",
                          )
                        }
                      >
                        <div className="relative w-14 h-14 border border-text-muted/20 flex items-center justify-center group-hover:border-accent transition-colors duration-300">
                          <div
                            className={`text-3xl text-text-muted group-hover:text-accent transition-all duration-300 group-hover:translate-x-1`}
                          >
                            <IoIosArrowRoundForward />
                          </div>
                        </div>
                        <span className="text-text-muted text-sm font-medium tracking-wide uppercase group-hover:text-accent transition-colors duration-300">
                          Meet the Team
                        </span>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm text-text-secondary flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-linear-to-br from-white to-gray-50 p-8 rounded-2xl max-w-lg w-full mx-4 shadow-2xl border-2 border-accent/20 transform transition-all"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-accent/20">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <HiOutlinePencilAlt className="text-accent text-3xl" />
                Edit {editing.name}
              </h3>
              <button
                type="button"
                onClick={closeEdit}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>

            <label className="block mb-2 text-sm font-bold text-text-secondary">
              Name
            </label>
            <input
              className="w-full mb-6 p-3 text-text-muted font-semibold border-2 border-gray-300 rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />

            <label className="block mb-2 text-sm font-bold text-text-secondary">
              Description
            </label>
            <textarea
              className="w-full mb-6 p-3 text-text-muted font-semibold border-2 border-gray-300 rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none"
              value={form.description}
              rows={6}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
            />

            <label className="block mb-2 text-sm font-bold text-text-secondary">
              Replace Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  imageFile: e.target.files?.[0] ?? null,
                }))
              }
              className="mb-6 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 file:cursor-pointer cursor-pointer"
            />

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-accent/20">
              <button
                type="button"
                onClick={closeEdit}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-text-secondary font-medium rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
