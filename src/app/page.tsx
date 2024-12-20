import Link from "next/link";

export default function Home() {
    return (
        <div
            className="hero min-h-screen"
            style={{
                backgroundImage: "url(/glasgow-w2024.JPG)",
                backgroundSize: "contain", // Changed to cover for better coverage
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                height: "100vh",
                width: "100%",
            }}>
            <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                    backgroundImage: "url(/glasgow-w2024.JPG)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    filter: "blur(10px)", // Apply the blur effect
                    zIndex: -1, // Place the background behind the content
                }}
            ></div>

            <div className="hero-overlay bg-opacity-80"></div>
            <div className="hero-content text-neutral-content text-center">
                <div className="max-w-md">
                    <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
                    <p className="mb-5">
                        Please Sign In to Continue
                    </p>
                    <Link href="auth/login" className="btn btn-primary">Sign In</Link>
                </div>
            </div>
        </div>
    )
}