"use client";

import { useEditor } from "../context/EditorContext";
import ClubFairOrderEditor from "./editors/ClubFairOrderEditor";
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
import BlogEditor from "./editors/BlogEditor";

export default function GlobalEditorModal() {
  const {
    editor,
    closeEditor,
  } = useEditor();

  if (!editor.isOpen || !editor.type) {
    return null;
  }

  const homeOrder = Array.isArray(editor.data)
    ? editor.data
    : [];

  const clubFairOrder = Array.isArray(editor.data)
    ? editor.data
    : [];

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black/70 p-2 backdrop-blur-sm sm:p-5">
      <div className="flex h-full w-full items-center justify-center">
        <div
          className="flex max-h-[96dvh] min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          data-lenis-prevent
          onWheel={(event) =>
            event.stopPropagation()
          }
          onTouchMove={(event) =>
            event.stopPropagation()
          }
        >
          {editor.type === "landing-hero" && (
            <LandingHeroEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "departments" && (
            <DepartmentsEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "contact" && (
            <ContactEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "joinus" && (
            <JoinUsEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "panelmembers" && (
            <PanelMembersEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "tours" && (
            <ToursEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "aboutSection" && (
            <AboutSectionEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "vision" && (
            <VisionEditor
              initialData={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "activities" && (
            <ActivitiesEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "gallery" && (
            <GalleryEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "home-order" && (
            <HomeOrderEditor
              order={homeOrder}
              onClose={closeEditor}
            />
          )}

          {editor.type === "blog" && (
            <BlogEditor
              data={editor.data}
              onClose={closeEditor}
            />
          )}

          {editor.type === "club-fair-order" && (
            <ClubFairOrderEditor
              order={clubFairOrder}
              onClose={closeEditor}
              onSaved={() => {
                window.location.reload();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}