import React, {useContext, useState} from "react";
import {PersonContext} from "@component/context/PersonContext";
import CustomCheckbox from "@component/components/CustomCheckbox";
import {PurchaseUpsert} from "@component/models/purchase";
import {
    constructNewPurchaseDetailCreate,
    populatePurchaseDetailShares,
    validatePurchaseCreate
} from "@component/utils/purchase";
import {useRouter} from 'next/router';


interface UpsertFormProps {
    initialPurchaseCreate: PurchaseUpsert
}

export default function PurchaseUpsertForm(upsertFormProps: UpsertFormProps) {
    const router = useRouter();
    const { persons, refreshPersons } = useContext(PersonContext);

    const [purchase, setPurchase] = useState<PurchaseUpsert>(upsertFormProps.initialPurchaseCreate);

    const handleStringInputChange = (
        e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setPurchase({
            ...purchase,
            [name]: value,
        });
    };

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPurchase({
            ...purchase,
            [name]: new Date(value),
        });
    }

    const handleAddPurchaseDetail = () => {
        setPurchase({
            ...purchase,
            purchase_details: [...purchase.purchase_details, constructNewPurchaseDetailCreate(persons)],
        });
    }

    const handlePurchaseDetailInputChange = (index: number, field: string, value: string | number) => {
        setPurchase(prevPurchase => {
            const updatedDetails = [...prevPurchase.purchase_details];
            updatedDetails[index] = {
                ...updatedDetails[index],
                [field]: field === 'quantity' || field === 'price' || field === 'tax_rate'
                    ? parseFloat(value as string) // Ensure the value is parsed as a number
                    : value
            };

            // Recalculate total_price based on quantity, price, and tax_rate
            const detail = updatedDetails[index];
            detail.total_price = detail.quantity * detail.price * (1 + detail.tax_rate / 100);

            const total_amount = updatedDetails.reduce((sum, detail) => sum + detail.total_price, 0);

            return {
                ...prevPurchase,
                total_amount: total_amount,
                purchase_details: updatedDetails
            };
        });
    };

    const handlePurchaseShareInputChange = (purchase_index: number, share_index: number, value: boolean) => {
        setPurchase(prevPurchase => {
            const updatedDetails = [...prevPurchase.purchase_details];

            const updatedShares = [...updatedDetails[purchase_index].shares_boolean];
            updatedShares[share_index] = value;

            updatedDetails[purchase_index] = {
                ...updatedDetails[purchase_index],
                shares_boolean: updatedShares
            };

            return {
                ...prevPurchase,
                purchase_details: updatedDetails
            };
        });
    }

    const handleDeletePurchaseDetail = (index: number) => {
        const confirmed = window.confirm(`Are you sure you want to delete purchase detail #${index + 1}?`);

        if (confirmed) {
            // Remove the purchase detail at the given index
            const updatedPurchaseDetails = purchase.purchase_details.filter((_, i) => i !== index);
            setPurchase({
                ...purchase,
                purchase_details: updatedPurchaseDetails,
            });
        }

    }

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            validatePurchaseCreate(purchase);
        } catch (error) {
            alert(error instanceof Error ?error.message : 'Unknown error');
            return;
        }

        const confirmationCode = prompt('Please enter the confirmation code to upsert purchase:');
        if (!confirmationCode) {
            alert('Confirmation code is required');
            return;
        }


        try {
            populatePurchaseDetailShares(purchase, persons);
            const response = await fetch(`/api/purchase/upsert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: confirmationCode, purchase: purchase }),
            });
            if (!response.ok) {
                // Extract error message from response
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('Balances refreshed:', result);

            await refreshPersons();
            alert('Purchase created/updated successfully');
            router.push('/');
        } catch (error) {
            console.error('Error creating purchase:', error);
            alert('Failed to create purchase');
        }
    }

    return (
        <form className="relative min-h-screen">

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 my-4">
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Name</span>
                    </div>
                    <input type="text" name="name" placeholder="Purchase Name" className="input input-bordered w-full max-w-xs" value={purchase.name} onChange={handleStringInputChange} />
                </label>

                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Store</span>
                    </div>
                    <input type="text" name="store" placeholder="Store Name" className="input input-bordered w-full max-w-xs" value={purchase.store} onChange={handleStringInputChange} />
                </label>

                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Date</span>
                    </div>
                    <input type="date" name="date" className="input input-bordered w-full max-w-xs" value={purchase.date?.toISOString().split('T')[0]} onChange={handleDateInputChange} />
                </label>

                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Paid by</span>
                    </div>
                    <select name="paid_by" defaultValue="" value={purchase.paid_by} className="select select-bordered" onChange={handleStringInputChange}>
                        <option value="" disabled> Who paid? </option>
                        {persons.map((person) => (
                            <option key={person.id} value={person.id}>{person.name}</option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="max-w-[100vw] overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                    <tr>
                        <th>Delete</th>
                        <th>No</th>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Tax (%)</th>
                        <th>Total Price</th>
                        <th>Communal</th>
                        {persons.map((person) => (
                            <th key={person.id}>{person.name}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {
                        purchase.purchase_details.map((purchaseDetail, index) => (
                            <tr key={index}>
                                <td>
                                    <button type="button" className="btn btn-ghost" onClick={() => handleDeletePurchaseDetail(index)}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                                            />
                                        </svg>
                                    </button>
                                </td>
                                <td className="font-bold">{index + 1}</td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder="Item name"
                                        className="input w-full max-w-xs"
                                        value={purchaseDetail.item_name}
                                        onChange={(e) => handlePurchaseDetailInputChange(index, 'item_name', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        className="input w-full max-w-28"
                                        value={purchaseDetail.quantity}
                                        onChange={(e) => handlePurchaseDetailInputChange(index, 'quantity', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Price"
                                        className="input w-full max-w-28"
                                        value={purchaseDetail.price}
                                        onChange={(e) => handlePurchaseDetailInputChange(index, 'price', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Tax rate"
                                        className="input w-full max-w-28"
                                        value={purchaseDetail.tax_rate}
                                        onChange={(e) => handlePurchaseDetailInputChange(index, 'tax_rate', e.target.value)}
                                    />
                                </td>
                                <td>{purchaseDetail.total_price.toFixed(2)}</td>

                                {
                                    purchaseDetail.shares_boolean.map((share, share_index) => (
                                        <td key={index * 10000 + share_index} className="text-center">
                                            {
                                                share_index === 0 ? (
                                                    <CustomCheckbox
                                                        checked={share}
                                                        onChange={(checked) => handlePurchaseShareInputChange(index, share_index, checked)}
                                                    />
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        checked={share}
                                                        onChange={(e) => handlePurchaseShareInputChange(index, share_index, e.target.checked)}
                                                        className="checkbox checkbox-primary"
                                                        disabled={share_index !== 0 && purchaseDetail.shares_boolean[0]}
                                                    />
                                                )
                                            }
                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-base-300 min-h-fit p-4 flex justify-center">
                <button type="button" className="btn btn-primary mx-2" onClick={handleAddPurchaseDetail}>Add Item</button>

                <h1 className="btn btn-ghost mx-2">Total: CAD {purchase.total_amount.toFixed(2)}</h1>


                <button type="submit" className="btn btn-primary mx-2" onClick={handleSubmit}>Submit</button>
            </div>
        </form>
    );
}