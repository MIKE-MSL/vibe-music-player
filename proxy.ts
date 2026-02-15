import { withAuth } from "next-auth/middleware";

// Next.js 16 introduces 'proxy.ts' as the new convention for request interception.
// We export the auth middleware as 'proxy' to comply with this change.
export const proxy = withAuth({
    pages: {
        signIn: "/",
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
