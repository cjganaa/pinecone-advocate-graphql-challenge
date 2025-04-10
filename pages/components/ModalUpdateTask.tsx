'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

// Define the mutation
const UPDATE_TASK = gql`
  mutation UpdateTask(
    $taskId: ID!
    $userId: String!
    $name: String
    $description: String
    $priority: Int
    $isDone: Boolean
    $tags: [String]
  ) {
    updateTask(
      taskId: $taskId
      userId: $userId
      name: $name
      description: $description
      priority: $priority
      isDone: $isDone
      tags: $tags
    ) {
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

interface Task {
    taskId: string
    userId: string
    name: string
    description: string
    priority: number
    isDone: boolean
    tags: string[]
}

export const UpdateTaskModal = ({ initialTask, refetchTasks }: { initialTask: Task, refetchTasks:()=>void}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [taskData, setTaskData] = useState(initialTask);
  const [updateTask, { data, loading, error }] = useMutation(UPDATE_TASK);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitting task data:', taskData);
    try {
      const response = await updateTask({
        variables: taskData
      });
      console.log('Task updated:', response.data);
      setIsOpen(false); // Close modal on success
      refetchTasks(); // Refetch tasks to get the updated list
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setTaskData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} style={buttonStyle}>Edit Task</button>

      {isOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>Update Task</h2>
            <form onSubmit={handleSubmit}>
              <div style={formGroupStyle}>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={taskData.name}
                  onChange={handleChange}
                />
              </div>

              <div style={formGroupStyle}>
                <label>Description:</label>
                <textarea
                  name="description"
                  value={taskData.description}
                  onChange={handleChange}
                />
              </div>

              <div style={formGroupStyle}>
                <label>Priority:</label>
                <input
                  type="number"
                  name="priority"
                  value={taskData.priority}
                  onChange={handleChange}
                  min="1"
                  max="5"
                />
              </div>

              <div style={formGroupStyle}>
                <label>
                  <input
                    type="checkbox"
                    name="isDone"
                    checked={taskData.isDone}
                    onChange={handleChange}
                  />
                  Completed
                </label>
              </div>

              <div style={formGroupStyle}>
                <label>Tags (comma-separated):</label>
                <input
                  type="text"
                  name="tags"
                  value={taskData.tags.join(', ')}
                  onChange={(e) => setTaskData(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim())
                  }))}
                />
              </div>

              {error && <p style={{ color: 'red' }}>{error.message}</p>}

              <div style={buttonGroupStyle}>
                <button type="submit" disabled={loading} style={buttonStyle}>
                  {loading ? 'Updating...' : 'Update Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  style={{ ...buttonStyle, backgroundColor: 'red' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Basic styles (you can move these to CSS)
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '5px',
  width: '400px',
  maxWidth: '90%'
};

const formGroupStyle = {
  marginBottom: '15px'
};

const buttonGroupStyle = {
  marginTop: '20px',
  display: 'flex',
  gap: '10px'
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#0070f3",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginTop: "10px",
}