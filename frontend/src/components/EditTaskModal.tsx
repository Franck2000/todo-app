
import type { Task } from "../pages/Dashboard";

type ModalProps = {
  task: Task | null;
  onClose: () => void;
  onChange: (task: Task) => void;
  onSave: () => void;
};

export default function EditTaskModal({ task, onClose, onChange, onSave }: ModalProps) {
  if (!task) return null;

  const updateField = (field: keyof Task, value: any) => {
    onChange({ ...task, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96 space-y-3">
        <h2 className="text-xl font-bold">Modifier la tâche</h2>

        <input
          className="w-full px-4 py-2 border rounded-lg"
          value={task.title}
          onChange={(e) => updateField("title", e.target.value)}
        />

        <textarea
          className="w-full px-4 py-2 border rounded-lg"
          value={task.description}
          onChange={(e) => updateField("description", e.target.value)}
        />

        <select
          className="w-full px-4 py-2 border rounded-lg"
          value={task.priority}
          onChange={(e) => updateField("priority", e.target.value)}
        >
          <option value="LOW">Faible</option>
          <option value="MEDIUM">Moyenne</option>
          <option value="HIGH">Élevée</option>
        </select>

        <select
          className="w-full px-4 py-2 border rounded-lg"
          value={task.status}
          onChange={(e) => updateField("status", e.target.value)}
        >
          <option value="TODO">À faire</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="DONE">Fait</option>
        </select>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Annuler
          </button>

          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
