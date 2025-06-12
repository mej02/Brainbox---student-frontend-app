import React, { useState, useEffect } from "react";
import { useStudents } from "../contexts/StudentContext";
import { useSubjects } from "../contexts/SubjectContext";
import { useGradeContext } from "../contexts/GradeContext";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import Modal from "./Modal";
import {
  User,
  Building2,
  CalendarDays,
  Book,
  UserCog,
  Image,
  Phone,
  MapPin,
  GraduationCap,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEnrollments } from "../contexts/EnrollmentContext";
import {
  getStudentImageUrl,
  DEFAULT_STUDENT_IMAGE,
  GENDER_OPTIONS,
  COURSES,
  YEAR_LEVELS,
} from "../utils/constants";

// Setup localizer for react-big-calendar
const localizer = momentLocalizer(moment);

export const StudentDashboard = ({ loggedInStudentId }) => {
  const { enrollments, fetchEnrollments, unenrollSubject } = useEnrollments();
  const { students, fetchStudents, enrollSubject, updateStudent } = useStudents();
  const { subjects, fetchSubjects } = useSubjects();
  const { grades, fetchGrades } = useGradeContext();
  useApp();
  const { token, loggedInStudentId: authStudentId } = useAuth();

  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    date_of_birth: "",
    course: "",
    year_level: "",
    section: "",
    contact_number: "",
    address: "",
  });

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("studentEvents");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((ev) => ({
        ...ev,
        start: ev.start ? new Date(ev.start) : new Date(),
        end: ev.end ? new Date(ev.end) : new Date(),
      }));
    } catch {
      localStorage.removeItem("studentEvents");
      return [];
    }
  });

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [editEventIdx, setEditEventIdx] = useState(null);
  const [editEventTitle, setEditEventTitle] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const currentStudentId = loggedInStudentId || authStudentId;

  // Always fetch everything on mount
  useEffect(() => {
    fetchStudents(token);
    fetchGrades(token);
    fetchSubjects(token);
    fetchEnrollments(token);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (currentStudentId) fetchEnrollments(token);
  }, [currentStudentId, fetchEnrollments, token]);

  useEffect(() => {
    if (Array.isArray(events)) {
      localStorage.setItem("studentEvents", JSON.stringify(events));
    } else {
      localStorage.removeItem("studentEvents");
    }
  }, [events]);

  const currentStudent = React.useMemo(() => {
    return students.find((s) => s.student_id === currentStudentId);
  }, [students, currentStudentId]);

  const studentGrades = React.useMemo(() => {
    return grades.filter((grade) => grade.student === currentStudentId);
  }, [grades, currentStudentId]);

  // Sync form with current student
  useEffect(() => {
    if (currentStudent) {
      setEditForm({
        student_id: currentStudent.student_id, // <-- add this line
        first_name: currentStudent.first_name || "",
        last_name: currentStudent.last_name || "",
        email: currentStudent.email || "",
        gender: currentStudent.gender || "",
        date_of_birth: currentStudent.date_of_birth || "",
        course: currentStudent.course || "",
        year_level: currentStudent.year_level || "",
        section: currentStudent.section || "",
        contact_number: currentStudent.contact_number || "",
        address: currentStudent.address || "",
      });
    }
  }, [currentStudent]);

  // Loading check to prevent undefined errors
  if (!currentStudent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-gray-500 text-lg">Loading student info...</span>
      </div>
    );
  }

  // Custom Toolbar for BigCalendar
  const CalendarToolbar = (toolbar) => (
    <div className="flex items-center justify-between mb-2">
      <button
        onClick={() => toolbar.onNavigate("PREV")}
        className="p-2 rounded hover:bg-gray-200"
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-lg font-semibold text-gray-800">
        {toolbar.label}
      </span>
      <button
        onClick={() => toolbar.onNavigate("NEXT")}
        className="p-2 rounded hover:bg-gray-200"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );

  // Handle slot (date) click
  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setShowEventModal(true);
    setNewEventTitle("");
  };

  // Handle event add
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    setEvents([
      ...events,
      {
        title: newEventTitle,
        start: selectedDate,
        end: selectedDate,
        allDay: true,
      },
    ]);
    setShowEventModal(false);
    setNewEventTitle("");
  };

  // Edit event
  const handleEditEvent = (idx) => {
    setEditEventIdx(idx);
    setEditEventTitle(events[idx].title);
    setShowEventModal(false); // Hide add modal if open
  };

  // Save edited event
  const handleSaveEditEvent = (e) => {
    e.preventDefault();
    if (!editEventTitle.trim()) return;
    setEvents(
      events.map((ev, idx) =>
        idx === editEventIdx ? { ...ev, title: editEventTitle } : ev
      )
    );
    setEditEventIdx(null);
    setEditEventTitle("");
  };

  // Delete event
  const handleDeleteEvent = (idx) => {
    setEvents(events.filter((_, i) => i !== idx));
  };

  // Defensive: check if events is an array before using it
  if (!Array.isArray(events)) {
    return null; // Or render an error message, depending on desired behavior
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-inter min-h-[90vh]">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <User className="mr-3 text-[#204032]" size={32} /> Student Dashboard
      </h2>

      <div className="mb-6 flex gap-2">
        <select
          className="border px-2 py-1 rounded flex-1"
          value={selectedSubjectCode}
          onChange={(e) => setSelectedSubjectCode(e.target.value)}
          disabled={!subjects.length}
        >
          <option value="">
            {subjects.length
              ? "Select a subject to enroll"
              : "Loading subjects..."}
          </option>
          {subjects
            .filter(
              (s) =>
                !enrollments.some((enrollment) => enrollment.subject === s.value)
            )
            .map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
        </select>
        <button
          className="bg-[#204032] text-white px-4 py-1 rounded hover:bg-[#183024] transition"
          onClick={async () => {
            if (!selectedSubjectCode) return;
            await enrollSubject(selectedSubjectCode);
            setSelectedSubjectCode("");
          }}
        >
          Enroll
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 items-start">
        {/* Profile */}
        <div className="md:col-span-1 bg-gray-50 rounded-lg p-6 shadow-sm flex flex-col items-center">
          <img
            src={getStudentImageUrl(currentStudent.image_url)}
            alt={`${currentStudent.first_name} ${currentStudent.last_name}`}
            className="w-32 h-32 rounded-full object-cover border-4 border-[#204032] mb-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_STUDENT_IMAGE;
            }}
          />
          <h3 className="text-2xl font-semibold text-gray-800 mb-1">
            {`${currentStudent.first_name} ${currentStudent.last_name}`}
          </h3>
          <p className="text-[#204032] text-lg mb-4">
            {currentStudent.student_id}
          </p>
          <div className="text-gray-700 text-sm w-full">
            <p className="flex items-center mb-2">
              <Building2 className="mr-2 text-gray-500" size={16} />
              <strong>Course:</strong> {currentStudent.course}
            </p>
            <p className="flex items-center mb-2">
              <CalendarDays className="mr-2 text-gray-500" size={16} />
              <strong>Year & Section:</strong>{" "}
              {`${currentStudent.year_level} - ${currentStudent.section}`}
            </p>
            <p className="flex items-center mb-2">
              <Book className="mr-2 text-gray-500" size={16} />
              <strong>Email:</strong> {currentStudent.email}
            </p>
            <p className="flex items-center mb-2">
              <UserCog className="mr-2 text-gray-500" size={16} />
              <strong>Gender:</strong> {currentStudent.gender}
            </p>
            <p className="flex items-center mb-2">
              <Image className="mr-2 text-gray-500" size={16} />
              <strong>Birthdate:</strong> {currentStudent.date_of_birth}
            </p>
            <p className="flex items-center mb-2">
              <Phone className="mr-2 text-gray-500" size={16} />
              <strong>Contact Number:</strong>{" "}
              {currentStudent.contact_number || "N/A"}
            </p>
            <p className="flex items-center mb-2">
              <MapPin className="mr-2 text-gray-500" size={16} />
              <strong>Address:</strong> {currentStudent.address || "N/A"}
            </p>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-[#204032] text-white rounded hover:bg-[#183024] transition"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </button>
        </div>

        {/* Grades and Enrolled Subjects stacked in the same column */}
        <div className="md:col-span-2 flex flex-col gap-8">
          {/* Grades Overview */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <GraduationCap className="mr-2" size={20} /> My Grades
            </h3>
            {studentGrades.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                No grades recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Final Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentGrades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {grade.subject_details.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parseInt(grade.activity_grade, 10)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parseInt(grade.quiz_grade, 10)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parseInt(grade.exam_grade, 10)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                          {grade.final_grade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* My Enrolled Subjects */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Book className="mr-2" size={20} /> My Enrolled Subjects
            </h3>
            <ul className="space-y-2">
              {enrollments.length === 0 ? (
                <li className="text-gray-500">
                  You have no enrolled subjects.
                </li>
              ) : (
                enrollments.map((enrollment) => {
                  // Use enrollment.subject or enrollment.subject_details
                  const subj = subjects.find(
                    (s) => s.value === enrollment.subject
                  );
                  return (
                    <li
                      key={enrollment.id}
                      className="flex justify-between items-center border p-2 rounded"
                    >
                      <span>
                        {subj?.label ||
                          enrollment.subject_details?.name ||
                          enrollment.subject}
                      </span>
                      <button
                        type="button"
                        className="text-red-600 hover:underline text-xs"
                        onClick={() => unenrollSubject(enrollment.id)}
                      >
                        Unenroll
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        {/* Calendar - NOW A SIBLING, NOT INSIDE md:col-span-2 */}
        <div className="md:col-span-1 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <CalendarDays className="mr-2" size={15} /> Calendar
          </h3>
          <div style={{ height: 325 }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={["month"]}
              defaultView="month"
              toolbar={true}
              selectable
              components={{ toolbar: CalendarToolbar }}
              style={{ height: 325, borderRadius: "0.75rem" }}
              popup
              date={calendarDate}
              onNavigate={(date) => setCalendarDate(date)}
              onSelectSlot={handleSelectSlot}
              eventPropGetter={() => ({
                style: {
                  backgroundColor: "#204032",
                  color: "#fff",
                  borderRadius: "6px",
                  padding: "2px 6px",
                  fontSize: "0.95rem",
                  border: "none",
                  boxShadow: "0 1px 4px rgba(32,64,50,0.08)",
                  letterSpacing: "0.01em",
                },
              })}
            />
          </div>

          {/* Events List */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Events:</h4>
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm">No events yet.</p>
            ) : (
              <ul className="space-y-1">
                {events.map((event, idx) => (
                  <li
                    key={idx}
                    className="flex items-center text-sm bg-gray-50 rounded px-2 py-1 mb-1 shadow-sm"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-[#204032] mr-2"></span>
                    {editEventIdx === idx ? (
                      <form
                        onSubmit={handleSaveEditEvent}
                        className="flex items-center gap-2 flex-1"
                      >
                        <input
                          type="text"
                          value={editEventTitle}
                          onChange={(e) => setEditEventTitle(e.target.value)}
                          className="border px-2 py-1 rounded flex-1"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="text-green-600 hover:underline text-xs px-2"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-gray-500 hover:underline text-xs px-2"
                          onClick={() => setEditEventIdx(null)}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <span className="font-medium text-[#204032] mr-2">
                          {event.title}
                        </span>
                        <span className="text-gray-500 mr-2">
                          |{" "}
                          {new Date(event.start).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <button
                          className="text-blue-600 hover:bg-blue-50 rounded-full p-1 mr-1 transition"
                          onClick={() => handleEditEvent(idx)}
                          aria-label="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:bg-red-50 rounded-full p-1 transition"
                          onClick={() => handleDeleteEvent(idx)}
                          aria-label="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h4 className="text-lg font-semibold mb-2">Add Event</h4>
            <form
              onSubmit={handleAddEvent}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                className="flex-1 border px-2 py-1 rounded"
                placeholder="Event title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#204032] text-white p-2 rounded hover:bg-[#183024] transition"
              >
                <Send size={18} />
              </button>
            </form>
            <button
              className="mt-3 text-sm text-gray-500 hover:underline"
              onClick={() => setShowEventModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData();
            Object.entries(editForm).forEach(([key, value]) => {
              if (key === "image_preview") return;
              if (key === "image" && !value) return;
              if (value !== undefined && value !== null) {
                formData.append(key, value);
              }
            });
            formData.append("student_id", currentStudent.student_id);
            const success = await updateStudent(
              currentStudent.student_id,
              formData,
              true
            );
            if (success) setIsEditModalOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, first_name: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, last_name: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, email: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                value={editForm.gender}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, gender: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Birthdate
              </label>
              <input
                type="date"
                value={editForm.date_of_birth}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, date_of_birth: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Course
              </label>
              <select
                value={editForm.course}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, course: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Course</option>
                {COURSES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Year Level
              </label>
              <select
                value={editForm.year_level}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, year_level: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Year Level</option>
                {YEAR_LEVELS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Section
            </label>
            <input
              type="number"
              value={editForm.section}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, section: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="text"
              value={editForm.contact_number}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, contact_number: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              value={editForm.address}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, address: e.target.value }))
              }
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="flex items-center space-x-4">
              <img
                src={
                  editForm.image_preview ||
                  getStudentImageUrl(currentStudent.image_url)
                }
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#204032]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_STUDENT_IMAGE;
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setEditForm((f) => ({
                    ...f,
                    image: file,
                    image_preview: file ? URL.createObjectURL(file) : null,
                  }));
                }}
                className="block text-sm text-gray-700"
              />
              {editForm.image && (
                <button
                  type="button"
                  onClick={() =>
                    setEditForm((f) => ({
                      ...f,
                      image: null,
                      image_preview: null,
                    }))
                  }
                  className="ml-2 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-150"
                  aria-label="Clear image"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Show enrolled subjects in Edit Profile modal */}
          {/* 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enrolled Subjects
            </label>
            <ul className="space-y-1">
              {enrollments.length === 0 ? (
                <li className="text-gray-500 text-sm">No enrolled subjects.</li>
              ) : (
                enrollments.map((enrollment) => {
                  const subj = subjects.find(
                    (s) => s.value === enrollment.subject
                  );
                  return (
                    <li key={enrollment.id} className="flex items-center gap-2">
                      <span>
                        {subj?.label ||
                          enrollment.subject_details?.name ||
                          enrollment.subject}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          */}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg shadow-md text-white bg-[#204032] hover:bg-[#183024] transition duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
