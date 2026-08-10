"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { HiBell, HiCalendar, HiSpeakerphone, HiOutlinePencilAlt, HiPlus, HiTrash, HiX, HiSave } from "react-icons/hi";
import { useAuth } from "@/app/context/AuthProvider";
import PageLoader from "@/app/components/ui/PageLoader";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "event" | "update" | "general";
  createdAt: string;
}

const typeMeta = {
  event: { icon: HiCalendar, color: "text-accent", label: "Event" },
  update: { icon: HiSpeakerphone, color: "text-blue-500", label: "Update" },
  general: { icon: HiBell, color: "text-text-secondary", label: "General" },
};

export default function NotificationsPage() {
  const { isLoggedIn, isAdmin } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("/api/content/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    fetchNotifications();
  }, [isLoggedIn, router, fetchNotifications]);

  const startEditing = () => {
    setDraft(JSON.parse(JSON.stringify(notifications)));
    setIsEditing(true);
  };

  const addNotification = () => {
    setDraft([
      {
        id: `notif-${Date.now()}`,
        title: "",
        message: "",
        type: "general",
        createdAt: new Date().toISOString(),
      },
      ...draft,
    ]);
  };

  const updateDraft = (index: number, field: keyof Notification, value: string) => {
    const copy = [...draft];
    copy[index] = { ...copy[index], [field]: value };
    setDraft(copy);
  };

  const removeDraft = (index: number) => {
    setDraft(draft.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(
        "/api/content/notifications",
        { notifications: draft },
        { withCredentials: true },
      );
      setNotifications(draft);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save notifications:", err);
      alert("Failed to save notifications");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading notifications" />;
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-bebasNeue text-5xl md:text-7xl text-text-secondary tracking-wider flex items-center gap-3">
              <HiBell className="text-accent" /> Notifications
            </h1>
            <p className="text-text-muted mt-2">
              Latest updates and upcoming events from BUAC.
            </p>
          </div>
          {isAdmin && !isEditing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent/90 transition cursor-pointer"
            >
              <HiOutlinePencilAlt /> Manage
            </button>
          )}
        </div>

        {isAdmin && isEditing ? (
          <div className="space-y-4">
            <button
              onClick={addNotification}
              className="w-full py-3 border-2 border-dashed border-accent/40 rounded-xl text-accent font-semibold hover:bg-accent/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <HiPlus /> Add Notification
            </button>

            {draft.map((n, i) => (
              <div
                key={n.id}
                className="bg-surface border border-text-secondary/10 rounded-2xl p-5 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">#{i + 1}</span>
                  <button
                    onClick={() => removeDraft(i)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <HiTrash />
                  </button>
                </div>
                <input
                  value={n.title}
                  onChange={(e) => updateDraft(i, "title", e.target.value)}
                  placeholder="Title"
                  className="w-full bg-input-bg border border-text-secondary/20 rounded-lg px-3 py-2 text-text-secondary focus:outline-none focus:border-accent"
                />
                <textarea
                  value={n.message}
                  onChange={(e) => updateDraft(i, "message", e.target.value)}
                  placeholder="Message"
                  rows={3}
                  className="w-full bg-input-bg border border-text-secondary/20 rounded-lg px-3 py-2 text-text-secondary focus:outline-none focus:border-accent resize-none"
                />
                <select
                  value={n.type}
                  onChange={(e) => updateDraft(i, "type", e.target.value)}
                  className="bg-input-bg border border-text-secondary/20 rounded-lg px-3 py-2 text-text-secondary focus:outline-none focus:border-accent"
                >
                  <option value="general">General</option>
                  <option value="event">Event</option>
                  <option value="update">Update</option>
                </select>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="flex items-center gap-2 rounded-full border border-text-muted/30 px-5 py-3 text-sm font-bold text-text-muted hover:border-accent hover:text-accent disabled:opacity-50 cursor-pointer"
              >
                <HiX /> Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
              >
                <HiSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((n, i) => {
                const meta = typeMeta[n.type] || typeMeta.general;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-surface backdrop-blur-sm border border-text-secondary/10 rounded-2xl p-6 shadow-xl flex gap-4"
                  >
                    <div className={`shrink-0 ${meta.color}`}>
                      <Icon className="text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bebasNeue text-2xl text-text-secondary tracking-wide">
                          {n.title}
                        </h3>
                        <span className={`text-xs uppercase tracking-widest ${meta.color}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-text-muted leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-xs text-text-muted/60 mt-2">
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-20 text-text-muted">
                <HiBell className="text-5xl text-text-muted/30 mx-auto mb-4" />
                <p className="text-lg">No notifications yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}