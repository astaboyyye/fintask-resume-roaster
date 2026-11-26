import { withAuth } from 'next-auth/middleware';

// Signed-out visitors are sent to /signin before these pages render.
// /api/roast checks the session itself so it can return a JSON 401.
export default withAuth({ pages: { signIn: '/signin' } });

export const config = { matcher: ['/history', '/roast/:path*'] };
