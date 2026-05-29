"use client";

import { createContext, useContext, useState } from "react";
import GlobalEditorModal from "../components/GlobalEditorModal";

type EditorState = {
  isOpen: boolean;
  type:
    | null
    | "landing-hero"
    | "departments"
    | "contact"
    | "joinus"
    | "panelmembers"
    | "tours"
    | "activities"
    | "gallery";
  data: any;
};

const EditorContext = createContext<any>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<EditorState>({
    isOpen: false,
    type: null,
    data: null,
  });

  const openEditor = (type: EditorState["type"], data: any) => {
    setEditor({ isOpen: true, type, data });
  };

  const closeEditor = () => {
    setEditor({ isOpen: false, type: null, data: null });
  };

  return (
    <EditorContext.Provider value={{ editor, openEditor, closeEditor }}>
      {children}
      <GlobalEditorModal />
    </EditorContext.Provider>
  );
}

export const useEditor = () => useContext(EditorContext);
