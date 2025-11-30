import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../prisma";
import { PaymentStatus } from "@prisma/client";

const paymentsRouter = Router();
const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey, { apiVersion: "2023-10-16" }) : null;

const intentSchema = z.object({
  amountCents: z.number().int().positive(),
  currency: z.string().default("usd"),
  reservationId: z.string().optional(),
  captureMethod: z.enum(["automatic", "manual"]).default("automatic"),
});

paymentsRouter.post("/intents", async (req, res) => {
  const parsed = intentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });
  if (!stripe) return res.status(503).json({ message: "Stripe is not configured" });

  const { amountCents, currency, reservationId, captureMethod } = parsed.data;

  try {
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      capture_method: captureMethod === "manual" ? "manual" : "automatic",
      automatic_payment_methods: { enabled: true },
      metadata: reservationId ? { reservationId } : undefined,
    });

    if (reservationId) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { paymentIntentId: intent.id, paymentStatus: PaymentStatus.authorized },
      });
    }

    return res.status(201).json({ clientSecret: intent.client_secret, intentId: intent.id, status: intent.status });
  } catch (err) {
    return res.status(400).json({ message: "Could not create payment intent", error: `${err}` });
  }
});

export { paymentsRouter };
