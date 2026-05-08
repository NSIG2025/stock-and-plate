import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (userId && session.customer) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: "ACTIVE",
            subscriptionTier: "PRO",
          },
        })
      }
      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const status = sub.status
      const isPro = status === "active" || status === "trialing"
      const isPastDue = status === "past_due"
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          subscriptionStatus: isPro ? "ACTIVE" : isPastDue ? "PAST_DUE" : "CANCELLED",
          subscriptionTier: isPro ? "PRO" : "FREE",
        },
      })
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { subscriptionStatus: "CANCELLED", subscriptionTier: "FREE" },
      })
      break
    }

    // Payment failed — suspend Pro access until resolved
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null }
      const subId = typeof invoice.subscription === "string" ? invoice.subscription : (invoice.subscription as { id: string } | null)?.id
      if (subId) {
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { subscriptionStatus: "PAST_DUE", subscriptionTier: "FREE" },
        })
      }
      break
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null }
      const subId = typeof invoice.subscription === "string" ? invoice.subscription : (invoice.subscription as { id: string } | null)?.id
      if (subId) {
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { subscriptionStatus: "ACTIVE", subscriptionTier: "PRO" },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
