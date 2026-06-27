import { courses } from "../config/courses.js";

export function listCourses(_req, res) {
  res.json({ courses });
}
