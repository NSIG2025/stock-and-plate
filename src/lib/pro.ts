import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function isPro() {
  const session = await getServerSession(authOptions)
  return session?.user?.subscriptionTier === "PRO"
}

export function isProClient(subscriptionTier?: string) {
  return subscriptionTier === "PRO"
}
