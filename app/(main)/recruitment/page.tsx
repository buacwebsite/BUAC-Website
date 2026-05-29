"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import axios from "axios";

interface JoinUsContent {
  heading: string;
  subheading: string;
  whyJoinHeading: string;
  benefits: Array<{
    title: string;
    description: string;
  }>;
  lookingForHeading: string;
  essentialQualitiesHeading: string;
  essentialQualities: string[];
  bonusPointsHeading: string;
  bonusPoints: string[];
  applyHeading: string;
  applySubheading: string;
  ctaHeading: string;
  ctaDescription: string;
}

const Recruitment = () => {
  const [content, setContent] = useState<JoinUsContent | null>(null);
  const [recruitmentActive, setRecruitmentActive] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get("/api/content/joinus");
        setContent(res.data.joinus);
      } catch (error) {
        console.error("Failed to fetch join us content:", error);
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const fetchRecruitmentSettings = async () => {
      try {
        const res = await axios.get("/api/content/recruitment-settings");
        setRecruitmentActive(res.data.isActive);
      } catch (error) {
        console.error("Failed to fetch recruitment settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchRecruitmentSettings();
  }, []);

  const benefitIcons = [
    <FaMountain key="mountain" className="text-4xl text-accent" />,
    <FaHiking key="hiking" className="text-4xl text-accent" />,
    <FaCompass key="compass" className="text-4xl text-accent" />,
    <FaCampground key="camp" className="text-4xl text-accent" />,
    <FaUsers key="users" className="text-4xl text-accent" />,
    <FaFire key="fire" className="text-4xl text-accent" />,
  ];

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-background/80 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          {auth && (
            <button
              onClick={() => openEditor("joinus", content)}
              className="absolute top-0 right-4 py-1 px-2 md:py-2 md:px-4 bg-accent flex items-center justify-center gap-2 text-smmd:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
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
                className="bg-background/50 backdrop-blur-sm border border-text-secondary/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-accent/20"
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

        <div className="bg-linear-to-br from-accent/5 to-accent/10 backdrop-blur-sm border border-accent/20 rounded-2xl p-8 md:p-12 mb-16 shadow-xl">
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
                        <span className="text-accent">▸</span>
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
                        <span className="text-accent">▸</span>
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
              <div className="text-center py-12">
                <div className="text-text-muted">Loading...</div>
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
              <div className="bg-linear-to-br from-accent/10 to-accent/5 backdrop-blur-sm border-2 border-accent/30 rounded-2xl p-12 text-center shadow-xl">
                <FaLock className="text-6xl text-accent mx-auto mb-4" />
                <h3 className="font-bebasNeue text-3xl text-text-secondary mb-4 tracking-wider">
                  Recruitment is Currently Closed
                </h3>
                <p className="text-text-muted text-lg max-w-xl mx-auto">
                  We&apos;re not accepting new applications at the moment.
                  Please check back later or follow our social media for updates
                  on when recruitment reopens!
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-linear-to-r from-accent/10 via-accent/5 to-accent/10 backdrop-blur-sm border border-accent/20 rounded-2xl p-12 text-center shadow-xl">
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
