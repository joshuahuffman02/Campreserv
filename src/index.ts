import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(env.port, () => {
      console.log(`API running on port ${env.port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

void start();
