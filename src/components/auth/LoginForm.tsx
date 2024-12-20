"use client";

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { AuthError } from "next-auth";
import { useSearchParams, useRouter } from 'next/navigation'

export default function SignIn() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const searchParams = useSearchParams()
    const router = useRouter();

    useEffect(() => {
        const error = searchParams.get('error');
        if (error === "CredentialsSignin") {
            setErrorMessage("Invalid credentials.");
        } else if (error === "SessionRequired") {
            setErrorMessage("Please sign in to continue.");
        } else {
            setErrorMessage(null); // Clear error if there's no error in the URL
        }
    }, [searchParams]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        setErrorMessage(null);

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();

        try {
            const response = await signIn('credentials', {
                email,
                password,
            });

            // if (response?.error) {
            //     setErrorMessage('Invalid credentials.');
            // } else {
            //     // Redirect to the page the user was trying to access or default to home
            //     const redirectUrl = searchParams.get('callbackUrl') || '/dashboard';
            //     router.push(redirectUrl);
            // }
        } catch (error) {
            if (error instanceof AuthError) {
                switch (error.type) {
                    case 'CredentialsSignin':
                        setErrorMessage('Invalid credentials.');
                        break;
                    default:
                        setErrorMessage('Something went wrong.');
                        break;
                }
            } else {
                setErrorMessage('Something went wrong.');
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form className="card-body" onSubmit={handleSubmit} >
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Email</span>
                </label>
                <input name="email" placeholder="email" className="input input-bordered" required />
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Password</span>
                </label>
                <input name="password" type="password" placeholder="password" className="input input-bordered" required />
                <label className="label">
                    <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                </label>
            </div>
            <div className="form-control mt-6">
                <button className="btn btn-primary" type="submit" aria-disabled={isPending}>Login</button>
            </div>

            <div
                className="flex h-8 items-end space-x-1"
                aria-live="polite"
                aria-atomic="true"
            >
                {errorMessage && (
                    <>
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    </>
                )}
            </div>
        </form>
    )
}