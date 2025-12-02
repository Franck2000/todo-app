import React from "react";

type TaskFormProps = {
  title: string;
  description: string;
  priority: string;
  status: string;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setPriority: (value: string) => void;
  setStatus: (value: string) => void;
  onSubmit: () => void;
};

export default function TaskForm({
  title,
  description,
  priority,
  status,
  setTitle,
  setDescription,
  setPriority,
  setStatus,
  onSubmit
}: TaskFormProps) {
  return (
    <div className="space-y-3 mb-6">
      <input
        placeholder="Titre"
        className="w-full px-4 py-2 border rounded-lg"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Description"
        className="w-full px-4 py-2 border rounded-lg"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        className="w-full px-4 py-2 border rounded-lg"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="LOW">Faible</option>
        <option value="MEDIUM">Moyenne</option>
        <option value="HIGH">Élevée</option>
      </select>

      <select
        className="w-full px-4 py-2 border rounded-lg"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="TODO">À faire</option>
        <option value="IN_PROGRESS">En cours</option>
        <option value="DONE">Fait</option>
      </select>

      <button
        onClick={onSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Ajouter la tâche
      </button>
    </div>
  );
}
