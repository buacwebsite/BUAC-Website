"use client";
import React, { useState } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";

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

interface JoinUsEditorProps {
  data: JoinUsContent;
  onClose: () => void;
}

export default function JoinUsEditor({ data, onClose }: JoinUsEditorProps) {
  useScrollLock(true);
  const [content, setContent] = useState<JoinUsContent>(data);
  const [saving, setSaving] = useState(false);
  const [recruitmentActive, setRecruitmentActive] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  React.useEffect(() => {
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

  const toggleRecruitment = async () => {
    try {
      const newStatus = !recruitmentActive;
      await axios.put("/api/content/recruitment-settings", { isActive: newStatus }, {
        withCredentials: true,
      });
      setRecruitmentActive(newStatus);
    } catch (error) {
      console.error("Failed to update recruitment status:", error);
      alert("Failed to update recruitment status");
    }
  };

  type StringFieldKey = Exclude<
    keyof JoinUsContent,
    "benefits" | "essentialQualities" | "bonusPoints"
  >;

  const updateField = <K extends StringFieldKey>(
    key: K,
    value: JoinUsContent[K],
  ) => {
    const newContent = { ...content };
    newContent[key] = value;
    setContent(newContent);
  };

  const updateBenefit = (index: number, field: string, value: string) => {
    const newContent = { ...content };
    newContent.benefits[index] = {
      ...newContent.benefits[index],
      [field]: value,
    };
    setContent(newContent);
  };

  const updateArrayItem = (
    array: "essentialQualities" | "bonusPoints",
    index: number,
    value: string,
  ) => {
    const newContent = { ...content };
    newContent[array][index] = value;
    setContent(newContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.put("/api/content/joinus", content, {
        withCredentials: true,
      });

      if (res.status === 200) {
        onClose();
        location.reload();
      } else {
        console.error("Failed to update join us content");
      }
    } catch (err) {
      console.error("Error updating join us content", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        data-lenis-prevent
        className="bg-linear-to-br from-white to-gray-50 text-text-muted p-8 rounded-2xl w-full max-w-4xl shadow-2xl border-2 border-accent/20 overflow-y-auto max-h-[90vh] overscroll-contain"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-accent/20">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <HiOutlinePencilAlt className="text-accent text-3xl" />
            Edit Join Us
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="mb-6 p-6 bg-linear-to-r from-accent/10 to-orange-500/10 rounded-xl border-2 border-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg mb-1 text-gray-800">Recruitment Status</h4>
              <p className="text-sm text-gray-600">
                {recruitmentActive 
                  ? "Recruitment form is currently active and accepting applications" 
                  : "Recruitment is currently closed. Toggle on to start accepting applications"}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleRecruitment}
              disabled={loadingSettings}
              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-accent/20 disabled:opacity-50 ${
                recruitmentActive ? "bg-accent" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  recruitmentActive ? "translate-x-11" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-b border-accent/20 pb-6">
            <h4 className="font-bold text-lg mb-4 text-accent">Hero Section</h4>

            <label className="block mb-2 text-sm font-bold">Main Heading</label>
            <input
              value={content.heading}
              onChange={(e) => updateField("heading", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <label className="block mb-2 text-sm font-bold">Subheading</label>
            <textarea
              value={content.subheading}
              onChange={(e) => updateField("subheading", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
              rows={3}
            />
          </div>

          <div className="border-b border-accent/20 pb-6">
            <h4 className="font-bold text-lg mb-4 text-accent">
              Why Join Section
            </h4>

            <label className="block mb-2 text-sm font-bold">
              Section Heading
            </label>
            <input
              value={content.whyJoinHeading}
              onChange={(e) => updateField("whyJoinHeading", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <h5 className="font-bold text-md mb-3 text-gray-700">Benefits</h5>
            {content.benefits.map((benefit, index) => (
              <div
                key={index}
                className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Benefit {index + 1} Title
                </label>
                <input
                  value={benefit.title}
                  onChange={(e) =>
                    updateBenefit(index, "title", e.target.value)
                  }
                  className="w-full mb-2 p-2 border border-gray-300 rounded focus:border-accent focus:ring-1 focus:ring-accent/20"
                />
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  value={benefit.description}
                  onChange={(e) =>
                    updateBenefit(index, "description", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="border-b border-accent/20 pb-6">
            <h4 className="font-bold text-lg mb-4 text-accent">
              What We&apos;re Looking For
            </h4>

            <label className="block mb-2 text-sm font-bold">
              Section Heading
            </label>
            <input
              value={content.lookingForHeading}
              onChange={(e) => updateField("lookingForHeading", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-bold">
                  Essential Qualities Heading
                </label>
                <input
                  value={content.essentialQualitiesHeading}
                  onChange={(e) =>
                    updateField("essentialQualitiesHeading", e.target.value)
                  }
                  className="w-full mb-3 p-2 border border-gray-300 rounded focus:border-accent focus:ring-1 focus:ring-accent/20"
                />
                {content.essentialQualities.map((quality, index) => (
                  <div key={index} className="mb-2">
                    <input
                      value={quality}
                      onChange={(e) =>
                        updateArrayItem(
                          "essentialQualities",
                          index,
                          e.target.value,
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:border-accent focus:ring-1 focus:ring-accent/20"
                      placeholder={`Quality ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold">
                  Bonus Points Heading
                </label>
                <input
                  value={content.bonusPointsHeading}
                  onChange={(e) =>
                    updateField("bonusPointsHeading", e.target.value)
                  }
                  className="w-full mb-3 p-2 border border-gray-300 rounded focus:border-accent focus:ring-1 focus:ring-accent/20"
                />
                {content.bonusPoints.map((point, index) => (
                  <div key={index} className="mb-2">
                    <input
                      value={point}
                      onChange={(e) =>
                        updateArrayItem("bonusPoints", index, e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:border-accent focus:ring-1 focus:ring-accent/20"
                      placeholder={`Point ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-b border-accent/20 pb-6">
            <h4 className="font-bold text-lg mb-4 text-accent">
              Apply Section
            </h4>

            <label className="block mb-2 text-sm font-bold">
              Apply Heading
            </label>
            <input
              value={content.applyHeading}
              onChange={(e) => updateField("applyHeading", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <label className="block mb-2 text-sm font-bold">
              Apply Subheading
            </label>
            <textarea
              value={content.applySubheading}
              onChange={(e) => updateField("applySubheading", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
              rows={2}
            />
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-accent">
              Bottom CTA Section
            </h4>

            <label className="block mb-2 text-sm font-bold">CTA Heading</label>
            <input
              value={content.ctaHeading}
              onChange={(e) => updateField("ctaHeading", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <label className="block mb-2 text-sm font-bold">
              CTA Description
            </label>
            <textarea
              value={content.ctaDescription}
              onChange={(e) => updateField("ctaDescription", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t-2 border-accent/20">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
