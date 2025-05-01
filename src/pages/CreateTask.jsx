"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaUser,
  FaFileAlt,
  FaCalendarAlt,
  FaFlag,
  FaTasks,
  FaUpload,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa"

const CreateTask = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    userId: "",
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
      const API_BASE = process.env.REACT_APP_API_BASE || "/api"
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-green-500">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-2 mb-1">
            <FaTasks className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-800">Create New Task</h2>
          </div>
          <p className="text-gray-600 mb-6">Fill in the details below to create a new task</p>

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
              <label htmlFor="userId" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaUser className="h-4 w-4 text-gray-500" />
                User ID
              </label>
              <input
                id="userId"
                name="userId"
                placeholder="Enter user ID"
                value={form.userId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
        <div className="px-6 py-4 bg-gray-50">
          <button
            className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
              isSubmitting ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={handleCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Creating Task...
              </div>
            ) : (
              "Create Task"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateTask
