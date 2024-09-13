import React from "react";
import {useRouter} from "next/router";

export default function HardRefreshBalances() {
    const router = useRouter();

    const handleRefreshBalances = async () => {
        const confirmationCode = prompt('Please enter the confirmation code to refresh balances:');
        if (!confirmationCode) {
            alert('Confirmation code is required');
            return;
        }

        try {
            const response = await fetch('/api/lib/hardRefresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: confirmationCode }),
            });

            if (!response.ok) {
                // Extract error message from response
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('Balances refreshed:', result);

            alert('Balances refreshed successfully');
            router.reload();
        } catch (error) {
            console.error('Error refreshing balances:', error);
            alert(`Failed to refresh balances: ${error.message}`);
        }
    }

    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Hard Refresh Balances</h1>
                    <p className="py-6">
                        Recalculates all balances of purchases and payments. This is useful when you suspect that the balances are incorrect.
                        Note that this operation is expensive so do not refresh too often.
                    </p>
                    <button className="btn btn-primary" onClick={handleRefreshBalances}>Refresh</button>
                </div>
            </div>
        </div>
    );
}