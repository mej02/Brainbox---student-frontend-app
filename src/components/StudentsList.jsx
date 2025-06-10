import React, { useEffect } from "react";
import { useStudents } from "../contexts/StudentContext";

const StudentsList = () => {
  const { students, fetchStudents } = useStudents();

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <ul>
      {students.map((student) => (
        <li key={student.id || student.student_id}>
          {student.name || student.first_name} ({student.email})
        </li>
      ))}
    </ul>
  );
};

export default StudentsList;