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
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const isActive = sub.status === "active" || sub.status === "trialing"
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          subscriptionStatus: isActive ? "ACTIVE" : "CANCELLED",
          subscriptionTier: isActive ? "PRO" : "FREE",
        },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
