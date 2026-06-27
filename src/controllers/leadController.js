import Lead from "../models/Lead.js";

export async function createLead(req, res, next) {
  try {
    const { email, interestedCourse } = req.body;

    if (!email || !interestedCourse) {
      return res.status(400).json({ message: "Email and interested course are required" });
    }

    const lead = await Lead.findOneAndUpdate(
      { email: email.toLowerCase().trim(), interestedCourse },
      {
        email,
        interestedCourse,
        userAgent: req.get("user-agent"),
        ipAddress: req.ip,
        source: req.body.source || "landing-page"
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      message: "You are on the waitlist. We will notify you when enrollment opens.",
      lead
    });
  } catch (error) {
    return next(error);
  }
}
