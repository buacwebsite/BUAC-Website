"use client";
import React, { useState } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";
import Image from "next/image";

interface PanelMember {
  name: string;
  position: string;
  image: string;
}

interface PanelMembersEditorProps {
  data: PanelMember[];
  onClose: () => void;
}

export default function PanelMembersEditor({
  data,
  onClose,
}: PanelMembersEditorProps) {
  useScrollLock(true);
  const [members, setMembers] = useState<PanelMember[]>(data);
  const [saving, setSaving] = useState(false);

  const updateMember = (
    index: number,
    field: keyof PanelMember,
    value: string,
  ) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/api/content/upload", formData);
      if (res.data.url) {
        updateMember(index, "image", res.data.url);
      }
    } catch (err) {
      console.error("Failed to upload image", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.put("/api/content/panelMembers", members, {
        withCredentials: true,
      });

      if (res.status === 200) {
        onClose();
        location.reload();
      } else {
        console.error("Failed to update panel members");
      }
    } catch (err) {
      console.error("Error updating panel members", err);
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
            Edit Panel Members
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
          {members.map((member, index) => (
            <div
              key={index}
              className="border-b border-accent/20 pb-6 last:border-b-0"
            >
              <h4 className="font-bold text-lg mb-4 text-accent">
                Panel Member {index + 1}
              </h4>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-bold">Name</label>
                  <input
                    value={member.name}
                    onChange={(e) =>
                      updateMember(index, "name", e.target.value)
                    }
                    className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder="John Doe"
                  />

                  <label className="block mb-2 text-sm font-bold">
                    Position
                  </label>
                  <input
                    value={member.position}
                    onChange={(e) =>
                      updateMember(index, "position", e.target.value)
                    }
                    className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder="President"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold">
                    Profile Image
                  </label>
                  <div className="space-y-3">
                    {member.image && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-300">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                      className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-white file:cursor-pointer hover:file:bg-accent/90"
                    />
                    <p className="text-xs text-gray-500">
                      Recommended: Portrait image, min 400x600px
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
