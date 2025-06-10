export const DEFAULT_STUDENT_IMAGE = "/default-student.png";
export function getStudentImageUrl(imageUrl) {
  return imageUrl ? imageUrl : DEFAULT_STUDENT_IMAGE;
}

export const COURSES = [
  { value: "BSIT", label: "BSIT - Bachelor of Science in Information Technology" },
  { value: "BSCS", label: "BSCS - Bachelor of Science in Computer Science" },
  { value: "BSCRIM", label: "BSCRIM - Bachelor of Science in Criminology" },
  { value: "BSBM", label: "BSBM - Bachelor of Science in Business Management" },
  { value: "BSED", label: "BSED - Bachelor of Secondary Education" },
  { value: "BSHM", label: "BSHM - Bachelor of Science in Hospitality Management" },
  { value: "BSP", label: "BSP - Bachelor of Science in Psychology" },
];

export const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export const GENDER_OPTIONS = ["Male", "Female", "Other"];