import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function isPro() {
  const session = await getServerSession(authOptions)
  return session?.user?.subscriptionTier === "PRO" || session?.user?.isAdmin === true
}

export function isProClient(subscriptionTier?: string, isAdmin?: boolean) {
  return subscriptionTier === "PRO" || isAdmin === true
}
