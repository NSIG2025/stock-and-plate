import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      subscriptionTier?: string
      subscriptionStatus?: string
      isAdmin?: boolean
      hasAiAddon?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    subscriptionTier?: string
    subscriptionStatus?: string
    isAdmin?: boolean
    hasAiAddon?: boolean
  }
}
