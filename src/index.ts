import dotenv from "dotenv";
import { app } from "./app";
import { prisma } from "./prisma";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);

async function start() {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

void start();
