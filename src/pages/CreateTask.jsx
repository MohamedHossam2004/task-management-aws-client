"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCookie } from "../utils/cookieUtils"; // Import getCookie
import {
  FaUser,
  FaFileAlt,
  FaCalendarAlt,
  FaFlag,
  FaTasks,
  FaUpload,
  FaExclamationCircle,
  FaSpinner,
  FaPlus
} from "react-icons/fa"

const CreateTask = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
    file: null,
  })

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setForm({ ...form, [name]: files ? files[0] : value })
  }

  const handleCreate = async () => {
    try {
      setIsSubmitting(true)
      setError("")

      const file = form.file
      const fileData = file
        ? {
            name: file.name,
            type: file.type,
            content: await toBase64(file),
          }
        : undefined

      const payload = { ...form, file: fileData }

      // Replace with your actual API endpoint
      const API_BASE = "https://jw1gmhmdjj.execute-api.us-east-1.amazonaws.com"
      const token = getCookie('access_token');
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Failed to create task")
      }

      await res.json()
      navigate("/tasks")
    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result.split(",")[1])
      reader.onerror = (error) => reject(error)
    })

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-2 rounded-lg mr-3 shadow-lg">
              <FaPlus className="h-6 w-6" />
            </div>
            Create New Task
          </h2>
          <p className="text-gray-500 mt-1">Fill in the details below to create a new task</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="px-2 py-4">

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <FaExclamationCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaFileAlt className="h-4 w-4 text-gray-500" />
                Title
              </label>
              <input
                id="title"
                name="title"
                placeholder="Enter task title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaFileAlt className="h-4 w-4 text-gray-500" />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter task description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FaTasks className="h-4 w-4 text-gray-500" />
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FaFlag className="h-4 w-4 text-gray-500" />
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="high" className="text-red-500 font-medium">
                    High
                  </option>
                  <option value="medium" className="text-amber-500 font-medium">
                    Medium
                  </option>
                  <option value="low" className="text-green-500 font-medium">
                    Low
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="due_date" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaCalendarAlt className="h-4 w-4 text-gray-500" />
                Due Date
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="file" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaUpload className="h-4 w-4 text-gray-500" />
                Attachment
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">{form.file ? form.file.name : "No file selected"}</p>
                  </div>
                  <input id="file" name="file" type="file" className="hidden" onChange={handleChange} />
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 px-2 py-4 bg-gray-50 rounded-b-lg">
          <button
            className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
              isSubmitting ? "bg-teal-400" : "bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
            } shadow-md transform hover:-translate-y-1 hover:shadow-lg`}
            onClick={handleCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Creating Task...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FaPlus className="mr-2" /> Create Task
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateTask
