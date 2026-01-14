import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

const JWT_COOKIE_NAME = "auth-token"
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET (또는 NEXTAUTH_SECRET)가 설정되어 있지 않습니다.")
  }
  return secret
}

export function createAuthToken(payload: { id: number; email: string }) {
  const secret = getJwtSecret()
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN_SECONDS })
}

export function verifyAuthToken(token: string) {
  const secret = getJwtSecret()
  return jwt.verify(token, secret) as { id: number; email: string; iat: number; exp: number }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value
  if (!token) return null

  try {
    const decoded = verifyAuthToken(token)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, createdAt: true },
    })
    return user
  } catch {
    return null
  }
}

export async function setAuthCookie(user: { id: number; email: string }) {
  const token = createAuthToken({ id: user.id, email: user.email })
  const cookieStore = await cookies()

  cookieStore.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: JWT_EXPIRES_IN_SECONDS,
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(JWT_COOKIE_NAME)
}


