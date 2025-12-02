import { useEffect, useState } from "react";
import api from "../services/api";
import TaskItem from "../components/TaskItem";
import TaskForm from "../components/TaskForm";
import EditTaskModal from "../components/EditTaskModal";

export type Task = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("LOW");
  const [status, setStatus] = useState("TODO");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const loadTasks = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data);
  };

  const createTask = async () => {
    await api.post("/tasks", { title, description, priority, status });
    setTitle("");
    setDescription("");
    setPriority("LOW");
    setStatus("TODO");
    loadTasks();
  };

  const deleteTask = async (id: number) => {
    await api.delete(`/tasks/${id}`);
    loadTasks();
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const updateTask = async () => {
    if (!selectedTask) return;
    await api.put(`/tasks/${selectedTask.id}`, selectedTask);
    setEditModalOpen(false);
    setSelectedTask(null);
    loadTasks();
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg relative">

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="absolute top-4 right-4 text-red-600 hover:text-red-800"
        >
          Déconnexion
        </button>

        <h1 className="text-2xl font-bold mb-6">Mes tâches</h1>

        <TaskForm
          title={title}
          description={description}
          priority={priority}
          status={status}
          setTitle={setTitle}
          setDescription={setDescription}
          setPriority={setPriority}
          setStatus={setStatus}
          onSubmit={createTask}
        />

        <ul className="space-y-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onDelete={deleteTask}
              onEdit={openEditModal}
            />
          ))}
        </ul>
      </div>

      {editModalOpen && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setEditModalOpen(false)}
          onChange={setSelectedTask}
          onSave={updateTask}
        />
      )}
    </div>
  );
}
