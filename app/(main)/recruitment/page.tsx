"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import RecruitmentForm from "../../components/RecruitmentForm";
import {
  FaMountain,
  FaHiking,
  FaCompass,
  FaCampground,
  FaUsers,
  FaFire,
  FaLock,
} from "react-icons/fa";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useEditor } from "@/app/context/EditorContext";
import { useAuth } from "@/app/context/AuthProvider";
import BUACLoader from "@/app/components/ui/BUACLoader";
import {
  STATIC_RECRUITMENT,
  type RecruitmentContent,
} from "@/lib/siteContent";
import { usePublicContent } from "@/lib/publicContent";

const Recruitment = () => {
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const { data: apiData } = usePublicContent<{ joinus: RecruitmentContent }>(
    "/api/content/joinus",
    { joinus: STATIC_RECRUITMENT },
  );

  const content = apiData?.joinus || STATIC_RECRUITMENT;

  const [recruitmentActive, setRecruitmentActive] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/content/recruitment-settings");
        setRecruitmentActive(res.data.isActive);
      } catch {
        console.error("Failed to fetch recruitment settings");
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const benefitIcons = [
    <FaMountain key="mountain" className="text-4xl text-accent" />,
    <FaHiking key="hiking" className="text-4xl text-accent" />,
    <FaCompass key="compass" className="text-4xl text-accent" />,
    <FaCampground key="camp" className="text-4xl text-accent" />,
    <FaUsers key="users" className="text-4xl text-accent" />,
    <FaFire key="fire" className="text-4xl text-accent" />,
  ];

  return (
    <div className="buac-gradient-bg min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          {auth && (
            <button
              onClick={() => openEditor("joinus", content)}
              className="absolute top-0 right-4 py-1 px-2 md:py-2 md:px-4 bg-accent flex items-center justify-center gap-2 text-sm md:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
              title="Edit Join Us Content"
            >
              <HiOutlinePencilAlt className="text-xl" />
              Edit
            </button>
          )}

          <h1 className="font-bebasNeue text-6xl md:text-8xl text-text-secondary mb-4 tracking-wider">
            {content.heading}
          </h1>
          <p className="text-text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {content.subheading}
          </p>
        </div>

        <div className="mb-20">
          <h2 className="font-bebasNeue text-4xl md:text-5xl text-text-secondary text-center mb-12 tracking-wider">
            {content.whyJoinHeading}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.benefits.map((benefit, index) => (
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
                <p className="text-text-muted leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface/70 backdrop-blur-md border border-accent/20 rounded-2xl p-8 md:p-12 mb-16 shadow-xl">
          <h2 className="font-bebasNeue text-3xl md:text-4xl text-text-secondary mb-6 tracking-wider">
            {content.lookingForHeading}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-text-muted">
            <div>
              <h3 className="font-bebasNeue text-xl text-text-secondary mb-3 tracking-wide">
                {content.essentialQualitiesHeading}
              </h3>
              <ul className="space-y-4">
                {content.essentialQualities.map(
                  (quality, index) =>
                    quality && (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-accent">■</span>
                        <span>{quality}</span>
                      </li>
                    ),
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-bebasNeue text-xl text-text-secondary mb-3 tracking-wide">
                {content.bonusPointsHeading}
              </h3>
              <ul className="space-y-4">
                {content.bonusPoints.map(
                  (point, index) =>
                    point && (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-accent">■</span>
                        <span>{point}</span>
                      </li>
                    ),
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="max-w-3xl mx-auto">
            {loadingSettings ? (
              <div className="flex items-center justify-center py-12">
                <BUACLoader size="md" />
              </div>
            ) : recruitmentActive ? (
              <>
                <div className="text-center mb-10">
                  <h2 className="font-bebasNeue text-4xl md:text-5xl text-text-secondary mb-4 tracking-wider">
                    {content.applyHeading}
                  </h2>
                  <p className="text-text-muted text-lg max-w-2xl mx-auto">
                    {content.applySubheading}
                  </p>
                </div>
                <RecruitmentForm />
              </>
            ) : (
              <div className="bg-surface/70 backdrop-blur-md border-2 border-accent/30 rounded-2xl p-12 text-center shadow-xl">
                <FaLock className="text-6xl text-accent mx-auto mb-4" />
                <h3 className="font-bebasNeue text-3xl text-text-secondary mb-4 tracking-wider">
                  Recruitment is Currently Closed
                </h3>
                <p className="text-text-muted text-lg max-w-xl mx-auto">
                  We are not accepting new applications at the moment. Please check back later.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface/70 backdrop-blur-md border border-accent/20 rounded-2xl p-12 text-center shadow-xl">
          <h2 className="font-bebasNeue text-3xl md:text-4xl text-text-secondary mb-4 tracking-wider">
            {content.ctaHeading}
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto mb-8">
            {content.ctaDescription}
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

export default Recruitment;