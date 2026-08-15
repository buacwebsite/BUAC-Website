"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";
import GlobalEditorModal from "../components/GlobalEditorModal";

export type EditorType =
  | null
  | "landing-hero"
  | "departments"
  | "contact"
  | "joinus"
  | "panelmembers"
  | "tours"
  | "activities"
  | "gallery"
  | "aboutSection"
  | "vision"
  | "home-order"
  | "blog";

interface EditorState {
  isOpen: boolean;
  type: EditorType;
  data: unknown;
}

interface EditorContextType {
  editor: EditorState;
  openEditor: (
    type: Exclude<EditorType, null>,
    data: unknown,
  ) => void;
  closeEditor: () => void;
}

const EditorContext =
  createContext<EditorContextType | null>(null);

export function EditorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [editor, setEditor] =
    useState<EditorState>({
      isOpen: false,
      type: null,
      data: null,
    });

  const openEditor = (
    type: Exclude<EditorType, null>,
    data: unknown,
  ) => {
    setEditor({
      isOpen: true,
      type,
      data,
    });
  };

  const closeEditor = () => {
    setEditor({
      isOpen: false,
      type: null,
      data: null,
    });
  };

  return (
    <EditorContext.Provider
      value={{
        editor,
        openEditor,
        closeEditor,
      }}
    >
      {children}

      <GlobalEditorModal />
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error(
      "useEditor must be used inside EditorProvider",
    );
  }

  return context;
}