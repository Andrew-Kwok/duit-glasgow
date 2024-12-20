import LoginForm from '@component/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="flex justify-center items-center bg-base-200 h-screen ">
            <div className="card bg-base-100 w-full max-w-md shadow-2xl">
                <LoginForm />
            </div>
        </div>
    )
}