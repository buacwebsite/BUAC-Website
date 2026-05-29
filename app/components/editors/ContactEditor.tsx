"use client";
import React, { useState } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";

interface ContactContent {
  heading: string;
  subheading: string;
  location: {
    line1: string;
    line2: string;
    line3: string;
  };
  email: string;
  phone: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  ctaHeading: string;
  ctaDescription: string;
}

interface ContactEditorProps {
  data: ContactContent;
  onClose: () => void;
}

export default function ContactEditor({ data, onClose }: ContactEditorProps) {
  useScrollLock(true);
  const [content, setContent] = useState<ContactContent>(data);
  const [saving, setSaving] = useState(false);

  const updateField = (path: string, value: string) => {
    const keys = path.split(".");
    const newContent = { ...content };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: Record<string, any> = newContent;

    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;

    setContent(newContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.put("/api/content/contact", content, {
        withCredentials: true,
      });

      if (res.status === 200) {
        onClose();
        location.reload();
      } else {
        console.error("Failed to update contact content");
      }
    } catch (err) {
      console.error("Error updating contact content", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        data-lenis-prevent
        className="bg-linear-to-br from-white to-gray-50 text-text-muted p-8 rounded-2xl w-full max-w-3xl shadow-2xl border-2 border-accent/20 overflow-y-auto max-h-[90vh] overscroll-contain"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-accent/20">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <HiOutlinePencilAlt className="text-accent text-3xl" />
            Edit Contact Page Content
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="space-y-6">
          {/* Hero Section */}
          <div className="border-b border-accent/20 pb-6">
            <h4 className="font-bold text-lg mb-4 text-accent">Hero Section</h4>

            <label className="block mb-2 text-sm font-bold">Main Heading</label>
            <input
              value={content.heading}
              onChange={(e) => updateField("heading", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="GET IN TOUCH"
            />

            <label className="block mb-2 text-sm font-bold">Subheading</label>
            <textarea
              value={content.subheading}
              onChange={(e) => updateField("subheading", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
              rows={3}
              placeholder="Ready to embark on your next adventure?..."
            />
          </div>

          {/* Location Section */}
          <div className="border-b border-accent/20 pb-6">
            <h4 className="font-bold text-lg mb-4 text-accent">Location</h4>

            <label className="block mb-2 text-sm font-bold">
              Address Line 1
            </label>
            <input
              value={content.location.line1}
              onChange={(e) => updateField("location.line1", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <label className="block mb-2 text-sm font-bold">
              Address Line 2
            </label>
            <input
              value={content.location.line2}
              onChange={(e) => updateField("location.line2", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <label className="block mb-2 text-sm font-bold">
              Address Line 3
            </label>
            <input
              value={content.location.line3}
              onChange={(e) => updateField("location.line3", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Contact Info */}
          <div className="border-b border-accent/20 pb-6">
            <h4 className="font-bold text-lg mb-4 text-accent">
              Contact Information
            </h4>

            <label className="block mb-2 text-sm font-bold">Email</label>
            <input
              type="email"
              value={content.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <label className="block mb-2 text-sm font-bold">Phone Number</label>
            <input
              value={content.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Social Links */}
          <div className="border-b border-accent/20 pb-6">
            <h4 className="font-bold text-lg mb-4 text-accent">
              Social Media Links
            </h4>

            <label className="block mb-2 text-sm font-bold">Facebook URL</label>
            <input
              type="url"
              value={content.socialLinks.facebook}
              onChange={(e) =>
                updateField("socialLinks.facebook", e.target.value)
              }
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <label className="block mb-2 text-sm font-bold">
              Instagram URL
            </label>
            <input
              type="url"
              value={content.socialLinks.instagram}
              onChange={(e) =>
                updateField("socialLinks.instagram", e.target.value)
              }
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <label className="block mb-2 text-sm font-bold">LinkedIn URL</label>
            <input
              type="url"
              value={content.socialLinks.linkedin}
              onChange={(e) =>
                updateField("socialLinks.linkedin", e.target.value)
              }
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* CTA Section */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-accent">
              Call-to-Action Section
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
              rows={3}
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
