import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ViewTask = () => {
  const [task, setTask] = useState(null);
  const { taskId } = useParams();

  useEffect(() => {
    const fetchTask = async () => {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`);
      const data = await res.json();
      setTask(data);
    };
    fetchTask();
  }, [taskId]);

  return (
    <div className="p-4">
      {task ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">{task.title}</h2>
          <p>{task.description}</p>
          <p>Status: {task.status}</p>
          <p>Priority: {task.priority}</p>
          {task.file_url && <a href={task.file_url} target="_blank" className="text-blue-500">View File</a>}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ViewTask;