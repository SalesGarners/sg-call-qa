import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
  // Protect all routes except for static assets, NextAuth endpoints, and login
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|.*\\.(?:png|jpg|jpeg|webp|svg)$).*)",
  ],
};
