"use client";

import { useState } from "react";
import axios from "axios";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { useScrollLock } from "@/lib/scrollLockHelper";

interface Objective {
  title: string;
  description: string;
}

interface VisionEditorProps {
  onClose: () => void;
  initialData?: {
    visionText?: string;
    objectives?: Objective[];
  };
}

export default function VisionEditor({
  onClose,
  initialData,
}: VisionEditorProps) {
  useScrollLock(true);
  const [visionText, setVisionText] = useState(initialData?.visionText || "");
  const [objectives, setObjectives] = useState<Objective[]>(
    initialData?.objectives || [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateObjective = (
    index: number,
    field: keyof Objective,
    value: string,
  ) => {
    const updated = [...objectives];
    updated[index] = { ...updated[index], [field]: value };
    setObjectives(updated);
  };

  const addObjective = () => {
    setObjectives([...objectives, { title: "", description: "" }]);
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/content/vision", {
        visionText,
        objectives,
      });

      if (response.status === 200) {
        alert("Vision content updated successfully!");
        window.location.reload();
      } else {
        alert("Failed to update vision content");
      }
    } catch (error) {
      console.error("Error updating vision content:", error);
      alert("An error occurred while updating");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto px-2 font-poppins">
      <div>
        <label className="block text-xl font-medium text-accent mb-2">
          Vision Text
        </label>
        <textarea
          value={visionText}
          onChange={(e) => setVisionText(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-text-muted/30 rounded-lg text-text-secondary focus:outline-none focus:border-accent resize-none"
          rows={4}
          placeholder="Enter your vision statement..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-xl font-medium text-accent">Objectives</label>
          <button
            type="button"
            onClick={addObjective}
            className="flex items-center gap-2 px-3 py-1 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors text-sm cursor-pointer"
          >
            <HiOutlinePlus size={16} />
            Add Objective
          </button>
        </div>

        <div className="space-y-4">
          {objectives.map((objective, index) => (
            <div
              key={index}
              className="p-4 bg-background/50 border border-text-muted/20 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  Objective {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
                  className="text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <HiOutlineTrash size={18} />
                </button>
              </div>

              <input
                type="text"
                value={objective.title}
                onChange={(e) =>
                  updateObjective(index, "title", e.target.value)
                }
                className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded-lg text-text-secondary focus:outline-none focus:border-accent text-sm"
                placeholder="Objective title..."
              />

              <textarea
                value={objective.description}
                onChange={(e) =>
                  updateObjective(index, "description", e.target.value)
                }
                className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded-lg text-text-secondary focus:outline-none focus:border-accent resize-none text-sm"
                rows={3}
                placeholder="Objective description..."
              />
            </div>
          ))}
        </div>

        {objectives.length === 0 && (
          <p className="text-center text-text-muted py-8 text-sm">
            No objectives added yet. Click &quot;Add Objective&quot; to get
            started.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-text-muted/20">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="px-6 py-2 bg-text-muted/20 text-text-secondary rounded-lg hover:bg-text-muted/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
