import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { createSupabaseClient } from "@component/app/api/lib/supabase";
import { z } from 'zod';
import bcrypt from 'bcrypt';
import type { UserCredentials } from '@component/models/user_credentials';
import { User as NextAuthUser } from 'next-auth';

async function getUser(email: string): Promise<UserCredentials> {
    const { data, error } = await createSupabaseClient()
        .from("user_credentials")
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        throw new Error(`Failed to fetch user: ${error.message}`);
    }

    if (!data) {
        throw new Error("Wrong username or password");
    }

    return data as UserCredentials;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials): Promise<NextAuthUser | null> {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    return null;
                }

                const { email, password } = parsedCredentials.data;
                const user = await getUser(email);

                if (!user) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(password, user.password_hash);
                if (passwordsMatch) {
                    const { password_hash, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                } else {
                    return null;
                }
            },
        }),
    ],
    // TODO: Figure out how the authorize function can return a custom user object
    // callbacks: {
    //     async session({ session }: { session: any }) {
    //         if (session && session.user && session.user.person_id === undefined) {
    //             try {
    //                 session.user = await getUser(session.user.email);
    //             } catch (error) {
    //                 console.error('Error fetching user:', error);
    //             }
    //         }
    //
    //         return session;
    //     }
    // }
});