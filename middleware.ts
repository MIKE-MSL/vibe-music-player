import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/",
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
