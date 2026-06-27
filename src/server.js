import dns from "dns";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();



dns.setServers(["8.8.8.8", "8.8.4.4"]);
console.log("Using DNS:", dns.getServers());

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`iTbenuk API running on port ${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Stop the existing server or set a different PORT in server/.env.`
        );
        process.exit(1);
      }

      console.error("Server failed to listen", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
