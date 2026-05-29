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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-background p-6 rounded-xl w-180">
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
  );
}
