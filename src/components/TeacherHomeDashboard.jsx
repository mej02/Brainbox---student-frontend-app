import React from "react";
import { useStudents } from "../contexts/StudentContext";
import { useSubjects } from "../contexts/SubjectContext";
import { useGradeContext } from "../contexts/GradeContext";
import { useAuth } from "../contexts/AuthContext";

const TeacherHomeDashboard = () => {
  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { grades } = useGradeContext();
  const { userRole } = useAuth();

  // Get the most recent 5 grades (sorted by id descending)
  const recentGrades = [...grades].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-inter w-full max-w-none">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Welcome!{" "}
        {userRole && (
          <span className="text-[#204032]">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
        <div className="bg-gray-50 rounded-lg p-6 shadow flex flex-col items-center">
          <span className="text-4xl font-bold text-[#204032]">
            {students.length}
          </span>
          <span className="text-gray-700 mt-2">Total Students</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 shadow flex flex-col items-center">
          <span className="text-4xl font-bold text-[#204032]">
            {subjects.length}
          </span>
          <span className="text-gray-700 mt-2">Subjects Offered</span>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6 shadow w-full">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Student Number
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentGrades.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                  No recent activity.
                </td>
              </tr>
            ) : (
              recentGrades.map((grade) => {
                const student = students.find(
                  (s) => s.student_id === grade.student
                );
                return (
                  <tr key={grade.id}>
                    <td className="px-4 py-2 text-sm">{grade.student}</td>
                    <td className="px-4 py-2 text-sm">
                      {student
                        ? `${student.first_name} ${student.last_name}`
                        : "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-sm">{grade.final_grade}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherHomeDashboard;