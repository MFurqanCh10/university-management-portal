import "dotenv/config";
import { sequelize } from "./config/database.js";
import app from "./app.js";

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    console.log("Database tables ready");
    console.log("PostgreSQL connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exitCode = 1;
  }
}

startServer();
