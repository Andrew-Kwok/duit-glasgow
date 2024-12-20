import {PurchaseDetail, PurchaseDetailUpsert} from "@component/models/purchase";
import {Person} from "@component/models/person";
import {calculatePriceShares} from "@component/lib/purchase";
import React from "react";

interface PurchaseSpendingShareProps {
    purchaseDetails: PurchaseDetail[];
    personArray: Person[];
}

export default function PurchaseSpendingShare(purchaseSpendingShareProps: PurchaseSpendingShareProps) {
    const spendingShare = calculatePriceShares(purchaseSpendingShareProps.purchaseDetails, purchaseSpendingShareProps.personArray);

    return (
        <div>
            <h1 className="text-xl font-bold">Spending Share</h1>
            <table className="table table-zebra">
                <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Spending Share</th>
                </tr>
                </thead>
                <tbody>
                {purchaseSpendingShareProps.personArray.map((person, index) => (
                    <tr key={person.id}>
                        <td>{index + 1}</td>
                        <td>{person.name}</td>
                        <td>{spendingShare.get(person.id)?.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}