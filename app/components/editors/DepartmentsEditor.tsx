"use client";
import React, { useState } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import axios from "axios";

interface Department {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface DepartmentsEditorProps {
  data: Department[];
  onClose: () => void;
}

export default function DepartmentsEditor({
  data,
  onClose,
}: DepartmentsEditorProps) {
  const [departments, setDepartments] = useState<Department[]>(data);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<any>({});

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...departments[index], imageFile: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null) return;

    let imageUrl = form.image;
    if (form.imageFile) {
      const formData = new FormData();
      formData.append("file", form.imageFile);
      const res = await axios.post("/api/content/upload", formData);
      if (!res.data.url) {
        alert("Image upload failed");
        return;
      }
      imageUrl = res.data.url;
    }

    const updated = { ...departments[editingIndex], ...form, image: imageUrl };
    const updatedDepartments = [...departments];
    updatedDepartments[editingIndex] = updated;

    // Save to backend KV
    await axios.put("/api/content/departments", updatedDepartments);

    setDepartments(updatedDepartments);
    setEditingIndex(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {departments.map((dept, i) => (
        <div
          key={dept.id}
          className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-accent/20"
        >
          <span className="font-medium">{dept.name}</span>
          <button
            onClick={() => startEdit(i)}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
          >
            Edit
          </button>
        </div>
      ))}

      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-linear-to-br from-white to-gray-50 p-8 rounded-2xl w-full max-w-lg shadow-2xl border-2 border-accent/20"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-accent/20">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <HiOutlinePencilAlt className="text-accent text-3xl" />
                Edit {form.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Close
              </button>
            </div>

            <label className="block mb-2 text-sm font-bold">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <label className="block mb-2 text-sm font-bold">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
            />

            <label className="block mb-2 text-sm font-bold">
              Replace Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, imageFile: e.target.files?.[0] ?? null })
              }
              className="mb-6 w-full file:py-2 file:px-4 file:rounded-lg file:bg-accent file:text-white hover:file:bg-accent/90 cursor-pointer"
            />

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-accent/20">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
