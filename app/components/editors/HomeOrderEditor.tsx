"use client";

import { useState } from "react";
import axios from "axios";
import {
  HiChevronUp,
  HiChevronDown,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import { HiXMark, HiBars3 } from "react-icons/hi2";

type HomeSectionId = "about" | "campfire" | "vision" | "cta";

const labels: Record<HomeSectionId, string> = {
  about: "About Us Section",
  campfire: "Campfire (torch effect)",
  vision: "Our Vision Section",
  cta: "Auth Call-To-Action Section",
};

const descriptions: Record<HomeSectionId, string> = {
  about: "About text, quotes, and stats",
  campfire: "Interactive torch dark section",
  vision: "Vision statement and objectives",
  cta: "Register / Sign-in prompt",
};

interface Props {
  data: HomeSectionId[];
  onClose: () => void;
}

export default function HomeOrderEditor({ data, onClose }: Props) {
  const [order, setOrder] = useState<HomeSectionId[]>(data);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const moveByOne = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const copy = [...order];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setOrder(copy);
  };

  const moveToPosition = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const copy = [...order];
    const [item] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, item);
    setOrder(copy);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    moveToPosition(draggedIndex, dropIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.put(
        "/api/content/home-order",
        { order },
        { withCredentials: true },
      );
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Failed to save section order:", err);
      setError("Failed to save order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setOrder(data);

  return (
    <div className="w-full max-w-2xl bg-background rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-accent/20">
        <h2 className="text-2xl font-bebasNeue text-text-secondary flex items-center gap-2">
          <HiOutlinePencilAlt className="text-accent" /> Reorder Home Sections
        </h2>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-secondary text-2xl cursor-pointer"
        >
          <HiXMark />
        </button>
      </div>

      <div className="mb-5 space-y-1 text-sm text-text-muted">
        <p>
          <strong className="text-text-secondary">3 ways to reorder:</strong>
        </p>
        <ul className="list-disc list-inside space-y-0.5 pl-2">
          <li>Drag & drop rows using the ⋮⋮ handle</li>
          <li>Use ▲ ▼ arrows for single step moves</li>
          <li>Pick a position from the dropdown for a direct jump</li>
        </ul>
        <p className="pt-1 text-xs">
          Hero section always stays on top and is not reorderable.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {order.map((id, i) => {
          const isDragging = draggedIndex === i;
          const isDragOver = dragOverIndex === i;
          return (
            <div
              key={id}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 bg-text-secondary/5 border rounded-xl p-4 transition-all ${
                isDragging
                  ? "opacity-40 border-accent"
                  : isDragOver
                  ? "border-accent bg-accent/10 scale-[1.01]"
                  : "border-text-muted/20 hover:border-accent/40"
              }`}
            >
              {/* Drag handle */}
              <div
                className="cursor-grab active:cursor-grabbing text-text-muted hover:text-accent transition"
                title="Drag to reorder"
              >
                <HiBars3 className="text-xl" />
              </div>

              {/* Position badge */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold text-sm">
                {i + 1}
              </span>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-secondary truncate">
                  {labels[id]}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {descriptions[id]}
                </p>
              </div>

              {/* Position dropdown */}
              <select
                value={i}
                onChange={(e) => moveToPosition(i, Number(e.target.value))}
                className="bg-background border border-text-muted/20 rounded-lg px-2 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-accent cursor-pointer"
                title="Move to position"
              >
                {order.map((_, pos) => (
                  <option key={pos} value={pos}>
                    Position {pos + 1}
                  </option>
                ))}
              </select>

              {/* Arrow buttons */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveByOne(i, -1)}
                  disabled={i === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-text-muted/20 hover:border-accent hover:text-accent transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Move up"
                >
                  <HiChevronUp />
                </button>
                <button
                  type="button"
                  onClick={() => moveByOne(i, 1)}
                  disabled={i === order.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-text-muted/20 hover:border-accent hover:text-accent transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Move down"
                >
                  <HiChevronDown />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center gap-3">
        <button
          type="button"
          onClick={reset}
          disabled={saving}
          className="text-sm text-text-muted hover:text-accent transition cursor-pointer disabled:opacity-50"
        >
          Reset changes
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-text-muted/20 text-text-muted rounded-lg hover:border-text-secondary hover:text-text-secondary transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Order"}
          </button>
        </div>
      </div>
    </div>
  );
}