import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma";
import { env } from "../config/env";
import { CampgroundRole, Role } from "@prisma/client";

const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const withMemberships = async (userId: string) => {
  const memberships = await prisma.campgroundMembership.findMany({
    where: { userId },
    select: { campgroundId: true, role: true },
  });
  return memberships;
};

const signAuthToken = async (userId: string, role: Role) => {
  const memberships = await withMemberships(userId);
  const token = jwt.sign({ userId, role, memberships }, env.jwtSecret, { expiresIn: "1d" });
  return { token, memberships };
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post("/register", async (req, res) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.format() });
  }
  const data = parseResult.data;
  const passwordHash = await bcrypt.hash(data.password, 10);
  try {
    const user = await prisma.user.create({
      data: { email: data.email, passwordHash, firstName: data.firstName, lastName: data.lastName },
    });
    const { token, memberships } = await signAuthToken(user.id, user.role);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, memberships } });
  } catch (err) {
    return res.status(400).json({ message: "Could not create user", error: `${err}` });
  }
});

authRouter.post("/login", async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.format() });
  }
  const { email, password } = parseResult.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const { token, memberships } = await signAuthToken(user.id, user.role);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, memberships } });
});

authRouter.post("/guest-token", async (_req, res) => {
  // Allow guest checkout without account, short-lived token to store contact info
  const token = jwt.sign({ userId: null, role: Role.guest, memberships: [] as { campgroundId: string; role: CampgroundRole }[] }, env.jwtSecret, {
    expiresIn: "12h",
  });
  res.json({ token });
});

export { authRouter };
