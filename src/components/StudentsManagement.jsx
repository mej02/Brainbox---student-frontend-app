import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";
import { useStudents } from "../contexts/StudentContext";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";
import {
  DEFAULT_STUDENT_IMAGE,
  GENDER_OPTIONS,
  COURSES,
  YEAR_LEVELS,
} from "../utils/constants";
import { getStudentImageUrl } from "../utils/helpers";

const StudentsManagement = () => {
  const { students, fetchStudents, addStudent, updateStudent, deleteStudent } =
    useStudents();
  const { loading } = useApp();
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    course: "",
    year_level: "",
    email: "",
    section: "",
    contact_number: "",
    address: "",
    image: null,
    current_image_url: DEFAULT_STUDENT_IMAGE,
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState(DEFAULT_STUDENT_IMAGE);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [formError, setFormError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "student_id",
    direction: "ascending",
  });

  useEffect(() => {
    fetchStudents(token);
  }, [fetchStudents, token]);

  // Reset form and image preview when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setStudentFormData({
        student_id: "",
        first_name: "",
        last_name: "",
        gender: "",
        date_of_birth: "",
        course: "",
        year_level: "",
        email: "",
        section: "",
        contact_number: "",
        address: "",
        image: null,
        current_image_url: DEFAULT_STUDENT_IMAGE,
      });
      setImagePreviewUrl(DEFAULT_STUDENT_IMAGE);
      setEditingStudent(null);
      setFormError("");
    }
  }, [isModalOpen]);

  // Memoized and sorted list of students based on search and sort configuration
  const filteredAndSortedStudents = React.useMemo(() => {
    let sortableItems = [...students];
    // Apply search filter
    if (searchQuery) {
      sortableItems = sortableItems.filter(
        (student) =>
          student.first_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.student_id
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          String(student.section).includes(searchQuery.toLowerCase()) ||
          student.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.year_level.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Apply sorting
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue =
          typeof a[sortConfig.key] === "string"
            ? a[sortConfig.key].toLowerCase()
            : a[sortConfig.key];
        const bValue =
          typeof b[sortConfig.key] === "string"
            ? b[sortConfig.key].toLowerCase()
            : b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [students, searchQuery, sortConfig]);

  // Handles sorting column clicks
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Returns sort icon based on current sort configuration
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={16} className="inline ml-1" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" />
    );
  };

  // Opens the modal for adding a new student
  const handleAddStudentClick = () => {
    setIsModalOpen(true);
    setEditingStudent(null);
    setStudentFormData({
      student_id: "",
      first_name: "",
      last_name: "",
      gender: "",
      date_of_birth: "",
      course: "",
      year_level: "",
      email: "",
      section: "",
      contact_number: "",
      address: "",
      image: null,
      current_image_url: DEFAULT_STUDENT_IMAGE,
    });
    setImagePreviewUrl(DEFAULT_STUDENT_IMAGE);
    setFormError("");
  };

  // Opens the modal for editing an existing student
  const handleEditStudentClick = (student) => {
    setIsModalOpen(true);
    setEditingStudent(student);
    setStudentFormData({
      ...student,
      image: null, // Don't prefill file input
      current_image_url: student.image_url || DEFAULT_STUDENT_IMAGE,
    });
    setImagePreviewUrl(getStudentImageUrl(student.image_url));
    setFormError("");
  };

  // Handles changes in the student form fields
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setStudentFormData((prev) => ({ ...prev, image: files[0] }));
      setImagePreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setStudentFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handles clearing the selected image in the form
  const handleClearImage = () => {
    setStudentFormData((prev) => ({ ...prev, image: null }));
    setImagePreviewUrl(DEFAULT_STUDENT_IMAGE);
  };

  // Validate required fields
  const validateForm = () => {
    const requiredFields = [
      "student_id",
      "first_name",
      "last_name",
      "gender",
      "date_of_birth",
      "course",
      "year_level",
      "email",
      "section",
      "contact_number",
      "address",
    ];
    for (let field of requiredFields) {
      if (!studentFormData[field]) {
        setFormError(`Field '${field.replace(/_/g, " ")}' is required.`);
        return false;
      }
    }
    setFormError("");
    return true;
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    let success = false;
    if (editingStudent) {
      // Edit
      const formData = new FormData();
      Object.entries(studentFormData).forEach(([key, value]) => {
        if (key === "image" && !value) return; // Don't send if not changed
        if (key === "current_image_url") return;
        formData.append(key, value);
      });
      success = await updateStudent(editingStudent.student_id, formData, token);
    } else {
      // Add
      const formData = new FormData();
      Object.entries(studentFormData).forEach(([key, value]) => {
        if (key === "current_image_url") return;
        if (key === "image") {
          if (value) formData.append(key, value);
        } else {
          formData.append(key, value == null ? "" : String(value));
        }
      });
      const result = await addStudent(formData, token);
      if (!result) {
        setFormError("Failed to add student. Please check all required fields.");
      } else {
        setIsModalOpen(false);
      }
    }
    if (success) {
      setIsModalOpen(false);
    }
  };

  // Handles click to delete a student, opens confirmation modal
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setIsConfirmModalOpen(true);
  };

  // Confirms and executes student deletion
  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      await deleteStudent(studentToDelete.student_id, token);
      setIsConfirmModalOpen(false);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-inter">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Users className="mr-3 text-[#204032]" size={32} /> Student Records
      </h2>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-auto flex-grow mr-4">
          <input
            type="text"
            placeholder="Search students..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <button
          onClick={handleAddStudentClick}
          className="flex items-center px-6 py-3 bg-[#204032] text-white rounded-lg shadow-md hover:bg-[#183024] transition duration-200 w-full sm:w-auto justify-center"
        >
          <Plus size={20} className="mr-2" /> Add New Student
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 py-4">Loading students...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("student_id")}
                >
                  Student ID {getSortIcon("student_id")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("last_name")}
                >
                  Full Name {getSortIcon("last_name")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("gender")}
                >
                  Gender {getSortIcon("gender")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("year_level")}
                >
                  Year & Section {getSortIcon("year_level")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("course")}
                >
                  Course {getSortIcon("course")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("date_of_birth")}
                >
                  Birthdate {getSortIcon("date_of_birth")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedStudents.map((student) => (
                  <tr key={student.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={getStudentImageUrl(student.image_url)}
                        alt={`${student.first_name} ${student.last_name}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_STUDENT_IMAGE;
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {`${student.first_name} ${student.last_name}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${student.year_level} - ${student.section}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.date_of_birth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditStudentClick(student)}
                          className="text-[#204032] hover:text-[#183024] p-1 rounded-md hover:bg-gray-100 transition duration-150"
                          aria-label="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100 transition duration-150"
                          aria-label="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? "Edit Student" : "Add New Student"}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="student_id"
              className="block text-sm font-medium text-gray-700"
            >
              Student ID
            </label>
            <input
              type="text"
              id="student_id"
              name="student_id"
              value={studentFormData.student_id}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
              disabled={!!editingStudent} // Disable if editing existing student
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={studentFormData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={studentFormData.last_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={studentFormData.gender}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="date_of_birth"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={studentFormData.date_of_birth}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700"
              >
                Course
              </label>
              <select
                id="course"
                name="course"
                value={studentFormData.course}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Course</option>
                {COURSES.map((course) => (
                  <option key={course.value} value={course.value}>
                    {course.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="year_level"
                className="block text-sm font-medium text-gray-700"
              >
                Year Level
              </label>
              <select
                id="year_level"
                name="year_level"
                value={studentFormData.year_level}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Year Level</option>
                {YEAR_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="section"
              className="block text-sm font-medium text-gray-700"
            >
              Section
            </label>
            <input
              type="text"
              id="section"
              name="section"
              value={studentFormData.section}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={studentFormData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="contact_number"
              className="block text-sm font-medium text-gray-700"
            >
              Contact Number
            </label>
            <input
              type="text"
              id="contact_number"
              name="contact_number"
              value={studentFormData.contact_number}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={studentFormData.address}
              onChange={handleChange}
              rows="2"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="flex items-center space-x-4">
              <img
                src={imagePreviewUrl}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-[#204032] mb-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_STUDENT_IMAGE;
                }}
              />
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="block text-sm text-gray-700"
              />
              {studentFormData.image && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="ml-2 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-150"
                  aria-label="Clear image"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          {formError && (
            <p className="text-red-500 text-sm mt-2">{formError}</p>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingStudent(null);
                setStudentFormData({
                  student_id: "",
                  first_name: "",
                  last_name: "",
                  gender: "",
                  date_of_birth: "",
                  course: "",
                  year_level: "",
                  email: "",
                  section: "",
                  contact_number: "",
                  address: "",
                  image: null,
                  current_image_url: DEFAULT_STUDENT_IMAGE,
                });
                setImagePreviewUrl(DEFAULT_STUDENT_IMAGE);
                setFormError("");
              }}
              className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
            >
              <X size={20} className="inline mr-1" /> Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg shadow-md text-white bg-[#204032] hover:bg-[#183024] transition duration-200"
            >
              {editingStudent ? "Update Student" : "Add Student"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete student ${studentToDelete?.first_name} ${studentToDelete?.last_name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default StudentsManagement;
