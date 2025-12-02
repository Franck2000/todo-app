 
type TaskProps = {
  task: any;
  onDelete: (id: number) => void;
  onEdit: (task: any) => void;
};

export default function TaskItem({ task, onDelete, onEdit }: TaskProps) {

  return (
    <li className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center">
      <div>
        <h3 className="font-bold text-lg">{task.title}</h3>
        <p className="text-sm text-gray-600">{task.description}</p>

        <div className="flex gap-3 mt-2">

          <span className={`px-2 py-1 rounded text-white text-sm
            ${task.priority === "HIGH" ? "bg-red-600" : 
              task.priority === "MEDIUM" ? "bg-yellow-500" : 
              "bg-green-600"}
          `}>
            {task.priority}
          </span>

          <span className={`px-2 py-1 rounded text-white text-sm
            ${task.status === "DONE" ? "bg-green-600" :
              task.status === "IN_PROGRESS" ? "bg-blue-600" :
              "bg-gray-600"}
          `}>
            {task.status}
          </span>

        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onEdit(task)}
          className="text-blue-600 hover:text-blue-800"
        >
          Éditer
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="text-red-600 hover:text-red-800"
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}
