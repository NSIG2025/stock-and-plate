import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, PRO_PRICE_ID } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

const AI_ADDON_PRICE_ID = process.env.STRIPE_AI_ADDON_PRICE_ID ?? ""

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { action } = await req.json()

  if (action === "checkout") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      customer_email: user?.email ?? undefined,
      success_url: process.env.NEXT_PUBLIC_APP_URL + "/settings?upgraded=true",
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + "/upgrade",
      metadata: { userId: session.user.id, type: "pro" },
    })
    return NextResponse.json({ url: checkoutSession.url })
  }

  if (action === "checkout_ai") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: AI_ADDON_PRICE_ID, quantity: 1 }],
      customer_email: user?.email ?? undefined,
      success_url: process.env.NEXT_PUBLIC_APP_URL + "/ai?activated=true",
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + "/ai",
      metadata: { userId: session.user.id, type: "ai_addon" },
    })
    return NextResponse.json({ url: checkoutSession.url })
  }

  if (action === "portal") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.stripeCustomerId) return NextResponse.json({ error: "No subscription" }, { status: 400 })
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: process.env.NEXT_PUBLIC_APP_URL + "/settings",
    })
    return NextResponse.json({ url: portalSession.url })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
