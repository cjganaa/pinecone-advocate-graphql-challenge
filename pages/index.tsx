import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation, gql } from "@apollo/client";
import {UpdateTaskModal} from "./components/ModalUpdateTask";

const GET_All_TASKS = gql`
  mutation GetAllDoneTasksLists($userId: String!){
    getUserAllTasksLists(userId: $userId) {
      id
      name
      description
      isDone
      priority
      tags
      createdAt
      updatedAt
      userId
    }
  }  
`;

const ADD_TASK_MUTATION = gql`
  mutation AddOne($name: String!, $description: String!, $priority: Int!, $tags: [String], $userId: String!) {
    addTask(name: $name, description: $description, priority: $priority, tags: $tags, userId: $userId) {
      name
      description
      isDone
      priority
      tags
      createdAt
      updatedAt
      userId
    }
  }
`;

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState({ username: "User", id: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refetch, { data, loading, error }] = useMutation(GET_All_TASKS, { variables: { userId: user.id } });
  
  const tasks = data?.getUserAllTasksLists || [];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      router.push("/login");
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
    if (user.id !== "") {
      refetch({ variables: { userId: user.id } });
    }
  }, [router, user.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log("Tasks:", tasks);
  return (
    <div>
      <DashboardHeader user={user} />
      <main style={{ padding: "20px", marginTop: "50px" }}>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px",
            position: "fixed",
            top: "60px",
            right: "20px",
          }}
        >
          Add New Task
        </button>
        <h2 style={{ marginTop: "20px" }}>Tasks List</h2>
        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p>Error loading tasks: {error.message}</p>
        ) : tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {tasks.map((task: any) => (
              <li style={taskItemStyle}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{
                  ...statusIconStyle,
                  color: task.isDone ? '#2ecc71' : '#e74c3c'
                }}>
                  {task.isDone ? '✔️' : '❌'}
                </span>
                <div style={{ flex: 1 }}>
                  <h3 style={titleStyle}>{task.name}</h3>
                  <p style={descriptionStyle}>{task.description}</p>
                  <p style={metaStyle}>Priority: {task.priority}</p>
                  <p style={tagsStyle}>
                    Tags:{' '}
                    {task.tags.map((tag:string, index:number) => (
                      <span key={index} style={tagSpanStyle}>
                        {tag}
                      </span>
                    ))}
                  </p>
                  <p style={metaStyle}>
                    Created At: {new Date(task.createdAt).toLocaleString()}
                  </p>
                  <UpdateTaskModal
                    initialTask={{
                      taskId: task.id,
                      userId: user.id,
                      name: task.name,
                      description: task.description,
                      priority: task.priority,
                      isDone: task.isDone,
                      tags: task.tags,
                    }}
                    refetchTasks={() => refetch({ variables: { userId: user.id }})}
                  />
                </div>
              </div>
            </li>
            ))}
          </ul>
        )}
      </main>
      {/* Modal with Task Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TaskForm userId={user.id} onSubmit={() => setIsModalOpen(false)} onClose={() => setIsModalOpen(false)} refetchTasks={() => refetch({ variables: { userId: user.id }})} />
      </Modal>
    </div>
  );
}

const taskItemStyle = {
  marginBottom: '15px',
  padding: '15px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  transition: 'box-shadow 0.2s ease-in-out',
  ':hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  }
};

const statusIconStyle = {
  marginRight: '10px',
  fontSize: '1.2em',
  verticalAlign: 'middle'
};

const titleStyle = {
  margin: '0 0 8px 0',
  fontSize: '1.2em',
  color: '#333',
  display: 'inline-block'
};

const descriptionStyle = {
  margin: '0 0 8px 0',
  color: '#666',
  fontSize: '0.95em',
  lineHeight: '1.4'
};

const metaStyle = {
  margin: '4px 0',
  color: '#888',
  fontSize: '0.9em'
};

const tagsStyle = {
  margin: '4px 0',
  fontSize: '0.9em'
};

const tagSpanStyle = {
  backgroundColor: '#f0f0f0',
  padding: '2px 6px',
  borderRadius: '4px',
  marginRight: '5px',
  color: '#555'
};

const DashboardHeader = ({ user }: { user: { username: string; id: string; email: string } }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "30px",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div style={{ fontSize: "18px", fontWeight: "bold" }}>{user.username}</div>
      <button
        onClick={handleLogout}
        style={{
          padding: "8px 16px",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Logout
      </button>
    </header>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          width: "400px",
          maxWidth: "90%",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// Task Form Component
const TaskForm = ({ userId, onSubmit, onClose,refetchTasks }: { userId: string; onSubmit: () => void; onClose: () => void; refetchTasks: () => void }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: 1,
    tags: "",
  });
  const [errors, setErrors] = useState({} as { [key: string]: string });
  const [addTask, { loading, error }] = useMutation(ADD_TASK_MUTATION);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.description) newErrors.description = "Description is required";
    else if (formData.description.length < 10) newErrors.description = "Description must be at least 10 characters";
    if (!formData.priority) newErrors.priority = "Priority is required";
    else if (formData.priority < 1 || formData.priority > 5) newErrors.priority = "Priority must be between 1 and 5";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const taskData = {
      name: formData.name,
      description: formData.description,
      priority: Number(formData.priority), // Convert to number for GraphQL Int
      tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
      userId,
    };

    try {
      const { data } = await addTask({ variables: taskData });
      console.log("Task added:", data.addTask);
      onSubmit(); // Close modal on success
      refetchTasks(); // Refetch tasks after adding a new one
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Task</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          style={{ width: "100%", padding: "5px" }}
          disabled={loading}
        />
        {errors.name && <p style={{ color: "red", fontSize: "12px" }}>{errors.name}</p>}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          style={{ width: "100%", padding: "5px", minHeight: "60px" }}
          disabled={loading}
        />
        {errors.description && <p style={{ color: "red", fontSize: "12px" }}>{errors.description}</p>}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Priority (1-5):</label>
        <input
          type="number"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          min="1"
          max="5"
          style={{ width: "100%", padding: "5px" }}
          disabled={loading}
        />
        {errors.priority && <p style={{ color: "red", fontSize: "12px" }}>{errors.priority}</p>}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Tags (comma-separated):</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          style={{ width: "100%", padding: "5px" }}
          placeholder="e.g., work, urgent"
          disabled={loading}
        />
      </div>

      {error && <p style={{ color: "red", fontSize: "12px" }}>Error: {error.message}</p>}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          Close
        </button>
      </div>
    </form>
  );
};