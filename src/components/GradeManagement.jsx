import React, { useState, useEffect } from "react";
import { useGradeContext } from "../contexts/GradeContext";
import { useStudents } from "../contexts/StudentContext";
import { useSubjects } from "../contexts/SubjectContext";
import { useApp } from "../contexts/AppContext";
import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Search, Loader2, Save, GraduationCap } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const GradeManagement = () => {
  const {
    grades,
    fetchGrades,
    addGrade,
    updateGrade,
    deleteGrade,
    calculateFinalGrade,
  } = useGradeContext();

  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { loading } = useApp();

  const getStudentName = React.useCallback(
    (studentId) => {
      const student = students.find(
        (s) => s.id === studentId || s.student_id === studentId
      );
      return student ? `${student.first_name} ${student.last_name}` : "Unknown";
    },
    [students]
  );

  const getSubjectName = React.useCallback(
    (subjectCode) => {
      const subject = subjects.find((sub) => sub.code === subjectCode);
      return subject ? subject.name : "Unknown";
    },
    [subjects]
  );



  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradeFormData, setGradeFormData] = useState({
    student: "",
    subject: "",
    activity: "",
    quiz: "",
    exam: "",
  });

  const handleGradeChange = (e) => {
    const { name, value } = e.target;
    setGradeFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [editingGrade, setEditingGrade] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "student",
    direction: "ascending",
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  const filteredAndSortedGrades = React.useMemo(() => {
    let sortableItems = [...grades];
    if (searchQuery) {
      sortableItems = sortableItems.filter((grade) => {
        const studentName = getStudentName(grade.student).toLowerCase();
        const subjectName = getSubjectName(grade.subject).toLowerCase();
        const query = searchQuery.toLowerCase();

        return (
          studentName.includes(query) ||
          subjectName.includes(query) ||
          String(grade.activity).includes(query) ||
          String(grade.quiz).includes(query) ||
          String(grade.exam).includes(query) ||
          String(
            calculateFinalGrade(grade.activity, grade.quiz, grade.exam)
          ).includes(query)
        );
      });
    }

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue;
        let bValue;

        if (sortConfig.key === "student") {
          aValue = getStudentName(a.student).toLowerCase();
          bValue = getStudentName(b.student).toLowerCase();
        } else if (sortConfig.key === "subject") {
          aValue = getSubjectName(a.subject).toLowerCase();
          bValue = getSubjectName(b.subject).toLowerCase();
        } else {
          aValue =
            typeof a[sortConfig.key] === "string"
              ? a[sortConfig.key].toLowerCase()
              : a[sortConfig.key];
          bValue =
            typeof b[sortConfig.key] === "string"
              ? b[sortConfig.key].toLowerCase()
              : b[sortConfig.key];
        }

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
  }, [
    grades,
    searchQuery,
    sortConfig,
    getStudentName,
    getSubjectName,
    calculateFinalGrade,
  ]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={16} className="inline ml-1" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" />
    );
  };

  const handleAddGradeClick = () => {
    setEditingGrade(null);
    setGradeFormData({
      student: "",
      subject: "",
      activity: "",
      quiz: "",
      exam: "",
    });
    setIsModalOpen(true);
  };

  const handleEditGradeClick = (grade) => {
    setEditingGrade(grade);
    setGradeFormData({
      student: grade.student,
      subject: grade.subject,
      activity: grade.activity,
      quiz: grade.quiz,
      exam: grade.exam,
    });
    setIsModalOpen(true);
  };

  //grades
  const handleModalSubmit = async (e) => {
    e.preventDefault();

    // Ensure numbers are sent as numbers, not strings
    const payload = {
      student: gradeFormData.student,
      subject: gradeFormData.subject,
      activity_grade: parseFloat(gradeFormData.activity),
      quiz_grade: parseFloat(gradeFormData.quiz),
      exam_grade: parseFloat(gradeFormData.exam),
    };

    let success;
    if (editingGrade) {
      success = await updateGrade(editingGrade.id, payload);
    } else {
      success = await addGrade(payload);
    }
    if (success) {
      toast.success(editingGrade ? "Grade updated successfully!" : "Grade added successfully!");
      setEditingGrade(null);
      setGradeFormData({
        student: "",
        subject: "",
        activity: "",
        quiz: "",
        exam: "",
      });
      setIsModalOpen(false);
    } else {
      toast.error("Failed to save grade!");
    }
  };

  const handleDeleteClick = (grade) => {
    setGradeToDelete(grade);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    let success = await deleteGrade(gradeToDelete.id);
    if (success) {
      toast.success("Grade deleted successfully!");
      setIsConfirmModalOpen(false);
      setGradeToDelete(null);
    } else {
      toast.error("Failed to delete grade!");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-inter">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <GraduationCap className="mr-3 text-[#204032]" size={32} /> Grade
        Records
      </h2>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-auto flex-grow mr-4">
          <input
            type="text"
            placeholder="Search grades by student, subject, or score..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <button
          onClick={handleAddGradeClick}
          className="flex items-center px-6 py-3 bg-[#204032] text-white rounded-lg shadow-md hover:bg-[#183024] transition duration-200 w-full sm:w-auto justify-center"
        >
          <Plus size={20} className="mr-2" /> Add New Grade
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 py-4">Loading grades...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("student")}
                >
                  Student Name {getSortIcon("student")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("subject")}
                >
                  Subject {getSortIcon("subject")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("activity")}
                >
                  Activity {getSortIcon("activity")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("quiz")}
                >
                  Quiz {getSortIcon("quiz")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("exam")}
                >
                  Exam {getSortIcon("exam")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedGrades.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No grades found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedGrades.map((grade) => (
                  <tr key={grade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getStudentName(grade.student)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSubjectName(grade.subject)} &nbsp;
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseInt(grade.activity_grade, 10)} &nbsp;
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseInt(grade.quiz_grade, 10)} &nbsp;
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseInt(grade.exam_grade, 10)}&nbsp;
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {grade.final_grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditGradeClick(grade)}
                          className="text-[#204032] hover:text-[#183024] p-1 rounded-md hover:bg-gray-100 transition duration-150"
                          aria-label="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(grade)}
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingGrade(null);
          setGradeFormData({
            student: "",
            subject: "",
            activity: "",
            quiz: "",
            exam: "",
          });
        }}
        title={editingGrade ? "Edit Grade" : "Add New Grade"}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="student"
              className="block text-sm font-medium text-gray-700"
            >
              Student
            </label>
            <select
              id="student"
              name="student"
              value={gradeFormData.student}
              onChange={handleGradeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
              disabled={!!editingGrade}
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {`${s.first_name} ${s.last_name} (${s.student_id})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              value={gradeFormData.subject}
              onChange={handleGradeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
              disabled={!!editingGrade}
            >
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {`${sub.code} - ${sub.name}`}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="activity"
                className="block text-sm font-medium text-gray-700"
              >
                Activity Score
              </label>
              <input
                type="number"
                id="activity"
                name="activity"
                value={gradeFormData.activity}
                onChange={handleGradeChange}
                min="0"
                max="100"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="quiz"
                className="block text-sm font-medium text-gray-700"
              >
                Quiz Score
              </label>
              <input
                type="number"
                id="quiz"
                name="quiz"
                value={gradeFormData.quiz}
                onChange={handleGradeChange}
                min="0"
                max="100"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="exam"
                className="block text-sm font-medium text-gray-700"
              >
                Exam Score
              </label>
              <input
                type="number"
                id="exam"
                name="exam"
                value={gradeFormData.exam}
                onChange={handleGradeChange}
                min="0"
                max="100"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingGrade(null);
                setGradeFormData({
                  student: "",
                  subject: "",
                  activity: "",
                  quiz: "",
                  exam: "",
                });
              }}
              className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg shadow-md text-white bg-[#204032] hover:bg-[#183024] transition duration-200"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin inline mr-2" size={20} />
              ) : (
                <Save size={20} className="inline mr-1" />
              )}
              {editingGrade ? "Update Grade" : "Add Grade"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete the grade for ${getStudentName(
          gradeToDelete?.student
        )} in ${getSubjectName(
          gradeToDelete?.subject
        )}? This action cannot be undone.`}
      />
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default GradeManagement;