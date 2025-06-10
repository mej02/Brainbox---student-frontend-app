import React, { useState, useEffect } from "react";
import { BookOpenText, Plus, Edit, Trash2, X, ChevronUp, ChevronDown, Search, Loader2, Save } from "lucide-react";
import { useSubjects } from "../contexts/SubjectContext";
import { useApp } from "../contexts/AppContext";
import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";

const SubjectManagement = () => {
  const { subjects, fetchSubjects, addSubject, updateSubject, deleteSubject } = useSubjects();

  const { loading } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    code: "",
    name: "",
    description: "",
    units: "",
  });
  const [editingSubject, setEditingSubject] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "code",
    direction: "ascending",
  });

  useEffect(() => {
    fetchSubjects();
  }, []);


  const filteredAndSortedSubjects = React.useMemo(() => {
    let sortableItems = [...subjects];
    if (searchQuery) {
      sortableItems = sortableItems.filter(
        (subject) =>
          subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
  }, [subjects, searchQuery, sortConfig]);

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

  const handleAddSubjectClick = () => {
    setEditingSubject(null);
    setSubjectFormData({ code: "", name: "", description: "", units: "" });
    setIsModalOpen(true);
  };

  const handleEditSubjectClick = (subject) => {
    setEditingSubject(subject);
    setSubjectFormData({
      code: subject.code,
      name: subject.name,
      description: subject.description || "",
      units: subject.units,
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubjectFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...subjectFormData,
      units: parseFloat(subjectFormData.units),
    };

    let success;
    if (editingSubject) {
      success = await updateSubject(editingSubject.code, payload);
    } else {
      success = await addSubject(payload);
    }

    if (success) {
      setEditingSubject(null);
      setSubjectFormData({ code: "", name: "", description: "", units: "" });
      setIsModalOpen(false);
    }
  };

  const handleDeleteClick = (subject) => {
    setSubjectToDelete(subject);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    let success = await deleteSubject(subjectToDelete.code);
    if (success) {
      setIsConfirmModalOpen(false);
      setSubjectToDelete(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-inter">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <BookOpenText className="mr-3 text-[#204032]" size={32} /> Subject
        Records
      </h2>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-auto flex-grow mr-4">
          <input
            type="text"
            placeholder="Search subjects..."
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
          onClick={handleAddSubjectClick}
          className="flex items-center px-6 py-3 bg-[#204032] text-white rounded-lg shadow-md hover:bg-[#183024] transition duration-200 w-full sm:w-auto justify-center"
        >
          <Plus size={20} className="mr-2" /> Add New Subject
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 py-4">Loading subjects...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("code")}
                >
                  Subject Code {getSortIcon("code")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("name")}
                >
                  Subject Name {getSortIcon("name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("units")}
                >
                  Units {getSortIcon("units")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedSubjects.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No subjects found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedSubjects.map((subject) => (
                  <tr key={subject.code}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      {subject.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.units}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditSubjectClick(subject)}
                          className="text-[#204032] hover:text-[#183024] p-1 rounded-md hover:bg-gray-100 transition duration-150"
                          aria-label="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(subject)}
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
          setEditingSubject(null);
          setSubjectFormData({
            code: "",
            name: "",
            description: "",
            units: "",
          });
        }}
        title={editingSubject ? "Edit Subject" : "Add New Subject"}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Subject Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={subjectFormData.code}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
              disabled={!!editingSubject}
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Subject Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={subjectFormData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="units"
              className="block text-sm font-medium text-gray-700"
            >
              Units
            </label>
            <input
              type="number"
              id="units"
              name="units"
              value={subjectFormData.units}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={subjectFormData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSubject(null);
                setSubjectFormData({
                  code: "",
                  name: "",
                  description: "",
                  units: "",
                });
              }}
              className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
            >
              <X size={20} className="inline mr-1" /> Cancel
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
              {editingSubject ? "Update Subject" : "Add Subject"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete subject "${subjectToDelete?.name} (${subjectToDelete?.code})"? This action cannot be undone.`}
      />
    </div>
  );
};

export default SubjectManagement;