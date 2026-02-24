import { withAuth } from "next-auth/middleware"

export default withAuth({
    pages: {
        signIn: "/login",
    },
})

export const config = {
    // Protect these paths. Note: / (the index) is NOT protected.
    matcher: ["/dashboard/:path*", "/inventory/:path*", "/rentals/:path*", "/orders/:path*", "/categories/:path*", "/brands/:path*"]
}
