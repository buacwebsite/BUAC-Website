"use client";

import type { WheelEvent, TouchEvent } from "react";
import { useEditor } from "../context/EditorContext";
import LandingHeroEditor from "./editors/LandingHeroEditor";
import DepartmentsEditor from "./editors/DepartmentsEditor";
import ContactEditor from "./editors/ContactEditor";
import JoinUsEditor from "./editors/JoinUsEditor";
import PanelMembersEditor from "./editors/PanelMembersEditor";
import ToursEditor from "./editors/ToursEditor";
import AboutSectionEditor from "./editors/AboutSectionEditor";
import VisionEditor from "./editors/VisionEditor";
import ActivitiesEditor from "./editors/ActivitiesEditor";
import GalleryEditor from "./editors/GalleryEditor";
import HomeOrderEditor from "./editors/HomeOrderEditor";

export default function GlobalEditorModal() {
  const context = useEditor();

  if (
    !context ||
    !context.editor.isOpen
  ) {
    return null;
  }

  const {
    editor,
    closeEditor,
  } = context;

  const homeOrder = Array.isArray(
    editor.data,
  )
    ? editor.data
    : editor.data &&
        typeof editor.data === "object" &&
        Array.isArray(editor.data.order)
      ? editor.data.order
      : [];

  const stopWheelPropagation = (
    event: WheelEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
  };

  const stopTouchPropagation = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          className="flex max-h-[96dvh] min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          data-lenis-prevent
          onWheel={stopWheelPropagation}
          onTouchMove={stopTouchPropagation}
        >
          {editor.type ===
            "landing-hero" && (
            <LandingHeroEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type ===
            "departments" && (
            <DepartmentsEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type ===
            "contact" && (
            <ContactEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type ===
            "joinus" && (
            <JoinUsEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type ===
            "panelmembers" && (
            <PanelMembersEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type ===
            "tours" && (
            <ToursEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type ===
            "aboutSection" && (
            <AboutSectionEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type ===
            "vision" && (
            <VisionEditor
              initialData={
                editor.data
              }
              onClose={closeEditor}
            />
          )}

          {editor.type ===
            "activities" && (
            <ActivitiesEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type ===
            "gallery" && (
            <GalleryEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type ===
            "home-order" && (
            <HomeOrderEditor
              order={homeOrder}
              onClose={closeEditor}
            />
          )}
        </div>
      </div>
    </div>
  );
}