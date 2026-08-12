"use client";

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

export default function GlobalEditorModal() {
  const ctx = useEditor();

  if (!ctx || !ctx.editor.isOpen) return null;

  const { editor, closeEditor } = ctx;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          {editor.type === "landing-hero" && (
            <LandingHeroEditor data={editor.data} onClose={closeEditor} />
          )}

          {editor.type === "departments" && (
            <DepartmentsEditor data={editor.data} onClose={closeEditor} />
          )}

          {editor.type === "contact" && (
            <ContactEditor data={editor.data} onClose={closeEditor} />
          )}

          {editor.type === "joinus" && (
            <JoinUsEditor data={editor.data} onClose={closeEditor} />
          )}

          {editor.type === "panelmembers" && (
            <PanelMembersEditor data={editor.data} onClose={closeEditor} />
          )}

          {editor.type === "tours" && (
            <ToursEditor data={editor.data} onClose={closeEditor} />
          )}

          {editor.type === "aboutSection" && (
            <AboutSectionEditor data={editor.data} onClose={closeEditor} />
          )}

          {editor.type === "vision" && (
            <VisionEditor initialData={editor.data} onClose={closeEditor} />
          )}

          {editor.type === "activities" && (
            <ActivitiesEditor data={editor.data} onClose={closeEditor} />
          )}

          {editor.type === "gallery" && (
            <GalleryEditor data={editor.data} onClose={closeEditor} />
          )}
        </div>
      </div>
    </div>
  );
}