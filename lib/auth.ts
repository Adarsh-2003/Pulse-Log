import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

function plainPasswordOk(expected: string, given: string): boolean {
  if (expected.length !== given.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(given, "utf8"));
  } catch {
    return false;
  }
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = process.env.TRACKER_EMAIL?.trim().toLowerCase();
  if (!expectedEmail) return false;
  if (email.trim().toLowerCase() !== expectedEmail) return false;

  const plain = process.env.TRACKER_PASSWORD;
  if (plain != null && plain.length > 0) {
    return plainPasswordOk(plain, password);
  }

  const hash = process.env.TRACKER_PASSWORD_HASH?.trim();
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}
