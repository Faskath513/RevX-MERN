import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: "No active session" });
  }

  // Destroy the session cookie or invalidate JWT here
  res.setHeader("Set-Cookie", "next-auth.session-token=; Max-Age=0; path=/;");

  return res.status(200).json({ message: "Logged out successfully" });
}
