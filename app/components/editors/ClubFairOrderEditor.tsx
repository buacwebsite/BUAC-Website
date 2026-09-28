"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";
import {
  HiChevronDown,
  HiChevronUp,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import { HiBars3, HiXMark } from "react-icons/hi2";

type ClubFairSectionId =
  | "counter"
  | "application"
  | "whyJoin"
  | "cta";

interface ClubFairOrderEditorProps {
  order: ClubFairSectionId[];
  onClose: () => void;
  onSaved: (order: ClubFairSectionId[]) => void;
}

const defaultOrder: ClubFairSectionId[] = [
  "counter",
  "application",
  "whyJoin",
  "cta",
];

const labels: Record<ClubFairSectionId, string> = {
  counter: "Registration Counter",
  application: "Registration Form",
  whyJoin: "Why Join BUAC",
  cta: "Contact CTA",
};

const descriptions: Record<ClubFairSectionId, string> = {
  counter: "Live registration count and active semester",
  application: "Club Fair application form",
  whyJoin: "Benefits of joining BUAC",
  cta: "Questions and contact section",
};

function normalizeOrder(
  input: unknown,
): ClubFairSectionId[] {
  const incoming = Array.isArray(input)
    ? input
    : [];

  const validItems = incoming.filter(
    (item): item is ClubFairSectionId =>
      item === "counter" ||
      item === "application" ||
      item === "whyJoin" ||
      item === "cta",
  );

  const uniqueItems = Array.from(
    new Set(validItems),
  );

  defaultOrder.forEach((sectionId) => {
    if (!uniqueItems.includes(sectionId)) {
      uniqueItems.push(sectionId);
    }
  });

  return uniqueItems;
}

export default function ClubFairOrderEditor({
  order,
  onClose,
  onSaved,
}: ClubFairOrderEditorProps) {
  const [currentOrder, setCurrentOrder] =
    useState<ClubFairSectionId[]>(
      normalizeOrder(order),
    );

  const [draggedIndex, setDraggedIndex] =
    useState<number | null>(null);

  const [dragOverIndex, setDragOverIndex] =
    useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const moveByOne = (
    index: number,
    direction: -1 | 1,
  ) => {
    const targetIndex = index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= currentOrder.length
    ) {
      return;
    }

    const updated = [...currentOrder];

    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];

    setCurrentOrder(updated);
  };

  const moveToPosition = (
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) {
      return;
    }

    const updated = [...currentOrder];
    const [moved] = updated.splice(
      fromIndex,
      1,
    );

    updated.splice(toIndex, 0, moved);
    setCurrentOrder(updated);
  };

  const save = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await axios.put(
        "/api/content/club-fair-order",
        {
          order: currentOrder,
        },
        {
          withCredentials: true,
        },
      );

      const savedOrder = normalizeOrder(
        response.data?.order ||
          currentOrder,
      );

      onSaved(savedOrder);
      onClose();
    } catch (requestError) {
      console.error(
        "Failed to save Club Fair order:",
        requestError,
      );

      if (
        requestError instanceof AxiosError
      ) {
        setError(
          requestError.response?.data
            ?.error ||
            "Failed to save section order.",
        );
      } else {
        setError(
          "Failed to save section order.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = (dropIndex: number) => {
    if (
      draggedIndex === null ||
      draggedIndex === dropIndex
    ) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    moveToPosition(
      draggedIndex,
      dropIndex,
    );

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5">
      <div
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        data-lenis-prevent
        onWheel={(event) =>
          event.stopPropagation()
        }
        onTouchMove={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-bebasNeue text-2xl tracking-wide text-text-secondary">
            <HiOutlinePencilAlt className="text-accent" />
            Reorder Club Fair Sections
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xl text-text-muted transition hover:bg-surface-secondary hover:text-accent disabled:opacity-50"
            aria-label="Close section order editor"
          >
            <HiXMark />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <p className="mb-5 text-sm text-text-muted">
            Drag sections to change their order.
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {currentOrder.map(
              (sectionId, index) => {
                const isDragging =
                  draggedIndex === index;

                const isDragOver =
                  dragOverIndex === index;

                return (
                  <div
                    key={sectionId}
                    draggable={!saving}
                    onDragStart={() =>
                      setDraggedIndex(index)
                    }
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverIndex(index);
                    }}
                    onDragLeave={() =>
                      setDragOverIndex(null)
                    }
                    onDrop={() =>
                      handleDrop(index)
                    }
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                      isDragging
                        ? "border-accent opacity-40"
                        : isDragOver
                          ? "scale-[1.01] border-accent bg-accent/10"
                          : "border-border bg-surface hover:border-accent/40"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-lg border border-accent/30 bg-accent/5 text-accent active:cursor-grabbing">
                      <HiBars3 className="text-xl" />
                    </div>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-text-secondary">
                        {labels[sectionId]}
                      </p>

                      <p className="truncate text-xs text-text-muted">
                        {descriptions[sectionId]}
                      </p>
                    </div>

                    <select
                      value={index}
                      onChange={(event) =>
                        moveToPosition(
                          index,
                          Number(
                            event.target.value,
                          ),
                        )
                      }
                      disabled={saving}
                      className="h-9 rounded-lg border border-input-border bg-input-bg px-2 text-xs text-text-secondary outline-none focus:border-accent disabled:opacity-50"
                    >
                      {currentOrder.map(
                        (_, position) => (
                          <option
                            key={position}
                            value={position}
                          >
                            Position{" "}
                            {position + 1}
                          </option>
                        ),
                      )}
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        moveByOne(index, -1)
                      }
                      disabled={
                        saving || index === 0
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-input-border bg-input-bg text-text-secondary hover:border-accent hover:text-accent disabled:opacity-30"
                      aria-label="Move section up"
                    >
                      <HiChevronUp />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveByOne(index, 1)
                      }
                      disabled={
                        saving ||
                        index ===
                          currentOrder.length - 1
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-input-border bg-input-bg text-text-secondary hover:border-accent hover:text-accent disabled:opacity-30"
                      aria-label="Move section down"
                    >
                      <HiChevronDown />
                    </button>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-background px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-muted hover:border-accent hover:text-accent disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="cursor-pointer rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Order"}
          </button>
        </div>
      </div>
    </div>
  );
}