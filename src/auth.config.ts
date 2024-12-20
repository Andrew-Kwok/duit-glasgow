import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnPurchase = nextUrl.pathname.startsWith('/purchase');
            const isOnPayment = nextUrl.pathname.startsWith('/payment');
            const isOnLogin = nextUrl.pathname.startsWith('/auth/login');

            if (isOnDashboard || isOnPayment || isOnPurchase) {
                return isLoggedIn;
            } else if (isOnLogin && isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;