import {useRouter} from "next/router";
import {Purchase} from "@component/models/purchase";
import React, {useContext, useEffect, useState} from "react";
import UpsertForm from "@component/components/purchase/PurchaseUpsertForm";
import {constructDuplicatePurchaseCreateFromPurchase} from "@component/utils/purchase";
import {PersonContext} from "@component/context/PersonContext";

export default function Update() {
    const router = useRouter();
    const { persons } = useContext(PersonContext);

    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getPurchase = async () => {
        try {
            const purchaseId = router.query.uuid.toString();
            const purchase = await fetch(`/api/purchase/getById?id=${purchaseId}`).then(response => response.json());
            setPurchase(purchase);
        } catch (error) {
            setError(error.message);
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
                <h1 className="text-xl font-bold"> Add New Purchase </h1>

                <UpsertForm initialPurchaseCreate={constructDuplicatePurchaseCreateFromPurchase(purchase, persons)} />
            </div>
        </div>
    )
}