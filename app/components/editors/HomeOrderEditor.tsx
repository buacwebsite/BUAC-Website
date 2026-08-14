"use client";

import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import axios, { AxiosError } from "axios";
import {
  HiChevronDown,
  HiChevronUp,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import { HiBars3, HiXMark } from "react-icons/hi2";

type HomeSectionId = "about" | "campfire" | "vision";

const validSectionIds: HomeSectionId[] = [
  "about",
  "campfire",
  "vision",
];

const defaultOrder: HomeSectionId[] = [
  "about",
  "campfire",
  "vision",
];

const labels: Record<HomeSectionId, string> = {
  about: "About Us Section",
  campfire: "Campfire Experience",
  vision: "Our Vision Section",
};

const descriptions: Record<HomeSectionId, string> = {
  about: "About text, quotes, and statistics",
  campfire: "Interactive torch and campfire section",
  vision: "Vision statement and objectives",
};

interface Props {
  /**
   * Used directly by the Home page.
   */
  order?: string[];

  /**
   * Supported for compatibility with GlobalEditorModal.
   */
  data?: string[] | { order?: string[] } | null;

  onClose: () => void;

  /**
   * Optional because GlobalEditorModal does not need to update
   * local Home page state directly.
   */
  onSaved?: (newOrder: string[]) => void;
}

function normalizeOrder(input: unknown): HomeSectionId[] {
  let incoming: unknown[] = [];

  if (Array.isArray(input)) {
    incoming = input;
  } else if (
    input &&
    typeof input === "object" &&
    "order" in input
  ) {
    const objectInput = input as {
      order?: unknown;
    };

    if (Array.isArray(objectInput.order)) {
      incoming = objectInput.order;
    }
  }

  const validIncoming = incoming.filter(
    (item): item is HomeSectionId =>
      typeof item === "string" &&
      validSectionIds.includes(item as HomeSectionId),
  );

  const uniqueOrder = Array.from(
    new Set(validIncoming),
  );

  validSectionIds.forEach((sectionId) => {
    if (!uniqueOrder.includes(sectionId)) {
      uniqueOrder.push(sectionId);
    }
  });

  return uniqueOrder.length > 0
    ? uniqueOrder
    : [...defaultOrder];
}

export default function HomeOrderEditor({
  order: orderProp,
  data,
  onClose,
  onSaved,
}: Props) {
  const initialOrder = useMemo(
    () => normalizeOrder(orderProp ?? data),
    [orderProp, data],
  );

  const [order, setOrder] =
    useState<HomeSectionId[]>(initialOrder);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [draggedIndex, setDraggedIndex] =
    useState<number | null>(null);

  const [dragOverIndex, setDragOverIndex] =
    useState<number | null>(null);

  const moveByOne = (
    index: number,
    direction: -1 | 1,
  ) => {
    const targetIndex = index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= order.length
    ) {
      return;
    }

    const updatedOrder = [...order];

    [
      updatedOrder[index],
      updatedOrder[targetIndex],
    ] = [
      updatedOrder[targetIndex],
      updatedOrder[index],
    ];

    setOrder(updatedOrder);
  };

  const moveToPosition = (
    fromIndex: number,
    toIndex: number,
  ) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      fromIndex >= order.length ||
      toIndex < 0 ||
      toIndex >= order.length
    ) {
      return;
    }

    const updatedOrder = [...order];
    const [movedItem] = updatedOrder.splice(
      fromIndex,
      1,
    );

    updatedOrder.splice(toIndex, 0, movedItem);

    setOrder(updatedOrder);
  };

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (saving) {
      event.preventDefault();
      return;
    }

    setDraggedIndex(index);
    setDragOverIndex(null);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      order[index],
    );
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    event.preventDefault();

    if (saving) return;

    event.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    dropIndex: number,
  ) => {
    event.preventDefault();

    if (
      draggedIndex === null ||
      draggedIndex === dropIndex ||
      saving
    ) {
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

  const resetOrder = () => {
    setOrder(normalizeOrder(orderProp ?? data));
    setError("");
  };

  const saveOrder = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await axios.put(
        "/api/content/home-order",
        {
          order,
        },
        {
          withCredentials: true,
        },
      );

      const savedOrder = normalizeOrder(
        response.data?.order ?? order,
      );

      if (onSaved) {
        onSaved(savedOrder);
        onClose();
        return;
      }

      onClose();
      window.location.reload();
    } catch (requestError) {
      console.error(
        "Failed to save home section order:",
        requestError,
      );

      if (requestError instanceof AxiosError) {
        setError(
          requestError.response?.data?.error ||
            requestError.response?.data?.message ||
            "Failed to save the section order.",
        );
      } else {
        setError(
          "Failed to save the section order. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex max-h-[85vh] min-h-[420px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-background"
      data-lenis-prevent
    >
      <div className="flex shrink-0 items-center justify-between border-b border-accent/20 px-5 py-4 sm:px-6">
        <h2 className="flex items-center gap-2 font-bebasNeue text-xl tracking-wide text-text-secondary sm:text-2xl">
          <HiOutlinePencilAlt className="shrink-0 text-accent" />
          Reorder Home Sections
        </h2>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl text-text-muted transition hover:bg-surface-secondary hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close reorder editor"
        >
          <HiXMark />
        </button>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 touch-pan-y sm:px-6"
        data-lenis-prevent
      >
        <div className="mb-5 space-y-1 text-sm text-text-muted">
          <p>
            <strong className="text-text-secondary">
              Reorder sections:
            </strong>
          </p>

          <ul className="list-disc space-y-1 pl-5 text-xs sm:text-sm">
            <li>
              Drag and drop using the handle.
            </li>
            <li>
              Use the arrow buttons to move one step.
            </li>
            <li>
              Use the position menu to move directly.
            </li>
          </ul>

          <p className="pt-1 text-xs">
            The Hero section always remains at the
            top.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {order.map((sectionId, index) => {
            const isDragging =
              draggedIndex === index;

            const isDragOver =
              dragOverIndex === index;

            return (
              <div
                key={sectionId}
                draggable={!saving}
                onDragStart={(event) =>
                  handleDragStart(event, index)
                }
                onDragOver={(event) =>
                  handleDragOver(event, index)
                }
                onDragLeave={handleDragLeave}
                onDrop={(event) =>
                  handleDrop(event, index)
                }
                onDragEnd={handleDragEnd}
                className={`flex flex-col gap-3 rounded-xl border p-3 transition-all sm:flex-row sm:items-center sm:p-4 ${
                  isDragging
                    ? "border-accent opacity-40"
                    : isDragOver
                      ? "scale-[1.01] border-accent bg-accent/10"
                      : "border-border bg-surface hover:border-accent/40"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-lg border border-accent/30 bg-accent/5 text-accent transition hover:bg-accent/15 active:cursor-grabbing"
                    title="Drag to reorder"
                  >
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
                </div>

                <div className="flex items-center justify-end gap-2">
                  <select
                    value={index}
                    onChange={(event) =>
                      moveToPosition(
                        index,
                        Number(event.target.value),
                      )
                    }
                    disabled={saving}
                    className="h-9 cursor-pointer rounded-lg border border-input-border bg-input-bg px-2 text-xs text-text-secondary outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                    title="Move to position"
                  >
                    {order.map((_, position) => (
                      <option
                        key={position}
                        value={position}
                      >
                        Position {position + 1}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      moveByOne(index, -1)
                    }
                    disabled={
                      saving || index === 0
                    }
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-input-border bg-input-bg text-text-secondary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Move ${labels[sectionId]} up`}
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
                      index === order.length - 1
                    }
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-input-border bg-input-bg text-text-secondary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Move ${labels[sectionId]} down`}
                  >
                    <HiChevronDown />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-background px-5 py-4 sm:px-6">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={resetOrder}
            disabled={saving}
            className="cursor-pointer text-sm text-text-muted transition hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset changes
          </button>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveOrder}
              disabled={saving}
              className="cursor-pointer rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}