import crypto from "crypto";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { courses } from "../config/courses.js";
import { getPrimaryClientUrl, isAllowedClientOrigin, isLocalDevOrigin } from "../config/clientOrigins.js";

function buildReference(userId, courseId) {
  return `itb_${courseId}_${userId}_${Date.now()}`;
}

function validatePhone(phone) {
  const normalized = String(phone || "").trim();
  const digitCount = normalized.replace(/\D/g, "").length;

  return /^\+?[0-9][0-9\s().-]{7,19}$/.test(normalized) && digitCount >= 8 && digitCount <= 15;
}

function getClientUrl(req) {
  const origin = req.get("origin");

  if (origin && (isAllowedClientOrigin(origin) || isLocalDevOrigin(origin))) {
    return new URL(origin).origin;
  }

  return getPrimaryClientUrl();
}

async function initializeStripeCheckout({ req, user, course, reference, phone }) {
  const secretKey = process.env.STRIPE_KEY || process.env.STRIPE_SECRET_KEY;
  const clientUrl = getClientUrl(req);

  if (!secretKey || secretKey.includes("replace_with")) {
    throw new Error("Stripe secret key is not configured");
  }

  const body = new URLSearchParams({
    mode: "payment",
    client_reference_id: reference,
    customer_email: user.email,
    success_url: `${clientUrl}/dashboard?checkout=success`,
    cancel_url: `${clientUrl}/enrollment?checkout=cancelled&course=${course.id}`,
    "metadata[userId]": String(user._id),
    "metadata[courseId]": course.id,
    "metadata[phone]": phone,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": course.currency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": String(course.price * 100),
    "line_items[0][price_data][product_data][name]": course.title
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = await response.json();

  if (!response.ok || !payload.url) {
    throw new Error(payload.error?.message || "Unable to initialize Stripe checkout");
  }

  return { checkoutUrl: payload.url, sessionId: payload.id };
}

export async function checkout(req, res, next) {
  try {
    const { courseId, phone } = req.body;
    const course = courses.find((item) => item.id === courseId && item.status === "active");

    if (!course) {
      return res.status(404).json({ message: "Active course not found" });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ message: "Please enter a valid phone number" });
    }

    const reference = buildReference(req.user._id, courseId);
    const { checkoutUrl, sessionId } = await initializeStripeCheckout({
      req,
      user: req.user,
      course,
      reference,
      phone: phone.trim()
    });

    await Payment.create({
      userId: req.user._id,
      courseId,
      courseTitle: course.title,
      amount: course.price,
      currency: course.currency,
      provider: "stripe",
      reference: sessionId,
      checkoutUrl
    });

    const existingEnrollment = req.user.enrolledCourses.find((item) => item.courseId === courseId);
    if (!existingEnrollment) {
      req.user.enrolledCourses.push({
        courseId,
        courseTitle: course.title,
        paymentStatus: "pending",
        paymentReference: sessionId
      });
      await req.user.save();
    }

    return res.status(201).json({ checkoutUrl, reference: sessionId });
  } catch (error) {
    return next(error);
  }
}

function verifyStripeSignature({ payload, signature, secret }) {
  if (!signature || !secret) return false;

  const parts = Object.fromEntries(signature.split(",").map((part) => part.split("=", 2)));
  const timestamp = parts.t;
  const expected = parts.v1;

  if (!timestamp || !expected) return false;

  const signedPayload = `${timestamp}.${payload.toString("utf8")}`;
  const digest = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  const digestBuffer = Buffer.from(digest);
  const expectedBuffer = Buffer.from(expected);

  return digestBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(digestBuffer, expectedBuffer);
}

export async function webhook(req, res, next) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.get("stripe-signature");

    if (webhookSecret && !verifyStripeSignature({ payload: req.body, signature, secret: webhookSecret })) {
      return res.status(401).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString("utf8"));
    const data = event.data || {};
    const session = data.object || {};

    if (event.type === "checkout.session.completed" && session.id) {
      const payment = await Payment.findOneAndUpdate(
        { reference: session.id },
        { status: "paid", rawEvent: event },
        { new: true }
      );

      if (payment) {
        await User.updateOne(
          { _id: payment.userId, "enrolledCourses.courseId": payment.courseId },
          {
            $set: {
              "enrolledCourses.$.paymentStatus": "paid",
              "enrolledCourses.$.paymentReference": payment.reference
            }
          }
        );
      }
    }

    return res.json({ received: true });
  } catch (error) {
    return next(error);
  }
}
