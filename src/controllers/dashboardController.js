export function getDashboard(req, res) {
  const enrolledCourses = req.user.enrolledCourses;
  const totalProgress = enrolledCourses.reduce((sum, course) => sum + course.progress, 0);
  const averageProgress = enrolledCourses.length
    ? Math.round(totalProgress / enrolledCourses.length)
    : 0;

  res.json({
    user: req.user.toSafeJSON(),
    stats: {
      enrolledCount: enrolledCourses.length,
      paidCount: enrolledCourses.filter((course) => course.paymentStatus === "paid").length,
      averageProgress
    }
  });
}

export async function updateProgress(req, res) {
  const { courseId } = req.params;
  const { progress } = req.body;
  const nextProgress = Number(progress);

  if (!Number.isFinite(nextProgress) || nextProgress < 0 || nextProgress > 100) {
    return res.status(400).json({ message: "Progress must be a number from 0 to 100" });
  }

  const enrollment = req.user.enrolledCourses.find((course) => course.courseId === courseId);

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  enrollment.progress = nextProgress;
  await req.user.save();

  return res.json({ user: req.user.toSafeJSON() });
}
