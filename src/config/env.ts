import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required");
}
