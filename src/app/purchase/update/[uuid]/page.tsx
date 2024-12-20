"use client";

import {Purchase} from "@component/models/purchase";
import React, {useContext, useEffect, useState, use } from "react";
import UpsertForm from "@component/components/purchase/PurchaseUpsertForm";
import {constructPurchaseCreateFromPurchase} from "@component/lib/purchase";
import {PersonContext} from "@component/context/PersonContext";

export default function Update({ params }: { params: Promise<{ uuid: string }> }) {
    const { persons } = useContext(PersonContext);

    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getPurchase = async () => {
        const purchaseId = (await params).uuid;

        try {
            const purchase = await fetch(`/api/purchase?id=${purchaseId}`).then(response => response.json());
            setPurchase(purchase);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unknown message");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPurchase();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!purchase) return <p>Purchase Not found</p>;

    return (
        <div className="flex justify-center bg-base-200 min-h-screen">
            <div className="max-width-screen-lg mt-8">
                <h1 className="text-xl font-bold"> Edit Purchase: {purchase.name} </h1>

                <UpsertForm initialPurchaseCreate={constructPurchaseCreateFromPurchase(purchase, persons)} />
            </div>
        </div>
    )
}