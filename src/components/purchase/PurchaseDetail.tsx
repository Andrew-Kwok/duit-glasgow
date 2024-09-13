import {Purchase} from "@component/models/purchase";
import {Person} from "@component/models/person";
import React, {useEffect, useState} from "react";

interface PurchaseDetailProps {
    purchaseId: string;
    personMap: Map<string, Person>;
}

export default function PurchaseDetail(purchaseDetailProps: PurchaseDetailProps) {
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPurchases = async () => {
            try {
                const response = await fetch(`/api/purchase/getById?id=${purchaseDetailProps.purchaseId}`);
                const purchase = await response.json();

                setPurchase(purchase);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        loadPurchases();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1 className="text-xl font-bold">Purchase Detail</h1>
            <table className="table table-zebra">
                <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Tax (%)</th>
                    <th>Total Price</th>
                    <th>Shares</th>
                </tr>
                </thead>
                <tbody>
                {
                    purchase?.purchase_details.map((purchaseDetail, index) => (
                        <tr key={purchaseDetail.id}>
                            <td>{index + 1}</td>
                            <td>{purchaseDetail.item_name}</td>
                            <td>{purchaseDetail.quantity}</td>
                            <td>{purchaseDetail.price.toFixed(2)}</td>
                            <td>{purchaseDetail.tax_rate.toFixed(2)}%</td>
                            <td>{purchaseDetail.total_price.toFixed(2)}</td>
                            <td className="grid grid-cols-2">
                                {purchaseDetail.shares.map((share, share_index) => (
                                    <div key={share_index}>
                                        {purchaseDetailProps.personMap.get(share.person_id)?.name}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>

            <div className="flex justify-end mt-4">
                <h2 className="text-lg font-bold">Total: CAD {purchase?.total_amount.toFixed(2)}</h2>
            </div>
        </div>
    );
}
