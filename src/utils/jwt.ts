import jwt from "jsonwebtoken"

export interface UserPayload {
  id: string
  email: string
  role: string
}

export const generateAccessToken = (payload: UserPayload): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables")
  }
  return jwt.sign(payload, secret, { expiresIn: "1h" })
}

export const generateRefreshToken = (payload: UserPayload): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables")
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" }) // Refresh token expires in 7 days
}

export const verifyToken = (token: string, type: "access" | "refresh"): UserPayload | null => {
  const secret = type === "access" ? process.env.JWT_SECRET : process.env.REFRESH_TOKEN_SECRET
  if (!secret) {
    throw new Error(`${type === "access" ? "JWT_SECRET" : "REFRESH_TOKEN_SECRET"} is not defined`)
  }
  try {
    const decoded = jwt.verify(token, secret) as UserPayload
    return decoded
  } catch (err) {
    console.error(`❌ Invalid ${type} Token`, err)
    return null
  }
}

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}
