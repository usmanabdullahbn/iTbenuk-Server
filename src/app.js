import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const allowedOrigins = new Set([
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      try {
        const { hostname, port, protocol } = new URL(origin);
        const isLocalDev =
          protocol.startsWith("http") &&
          port === "5173" &&
          (hostname === "localhost" || hostname === "127.0.0.1" || /^192\.168\./.test(hostname));

        if (allowedOrigins.has(origin) || isLocalDev) {
          return callback(null, true);
        }
      } catch (_error) {
        return callback(new Error("Invalid request origin"));
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "itbenuk-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
