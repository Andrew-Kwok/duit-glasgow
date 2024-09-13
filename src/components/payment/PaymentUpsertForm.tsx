import {PaymentUpsert} from "@component/models/payment";
import {PersonContext} from "@component/context/PersonContext";
import React, {useContext, useState} from "react";
import {validatePaymentUpsert} from "@component/utils/payment";
import {useRouter} from "next/router";

interface PaymentUpsertFormProps {
    initialPaymentUpsert: PaymentUpsert;
}

export default function PaymentUpsertForm(paymentUpsertFormProps: PaymentUpsertFormProps) {
    const router = useRouter();
    const { persons, refreshPersons } = useContext(PersonContext);
    const [payment, setPayment] = useState<PaymentUpsert>(paymentUpsertFormProps.initialPaymentUpsert);
    const handleStringInputChange = (
        e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setPayment({
            ...payment,
            [name]: value,
        });
    };

    const handleNumberInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setPayment({
            ...payment,
            [name]: parseFloat(value),
        });
    }

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setPayment({
            ...payment,
            [name]: new Date(value),
        });
    }

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            validatePaymentUpsert(payment);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('Unknown error');
            }
            return;
        }

        const confirmationCode = prompt('Please enter the confirmation code to upsert payment:');
        if (!confirmationCode) {
            alert('Confirmation code is required');
            return;
        }

        try {
            const response = await fetch(`/api/payment/upsert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: confirmationCode, payment: payment }),
            });

            if (!response.ok) {
                // Extract error message from response
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('Balances refreshed:', result);

            alert("Payment submitted successfully");
            router.reload();
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('Unknown error');
            }
        }
    }


    return (
        <div>

            <label className="form-control w-full max-w-sm">
                <div className="label">
                    <span className="label-text">Paid from</span>
                </div>
                <select name="from_person_id" defaultValue="" value={payment.from_person_id ? payment.from_person_id : ""} className="select select-bordered" onChange={handleStringInputChange}>
                    <option value="" disabled> Who paid? </option>
                    {persons.map((person) => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                </select>

                <div className="label">
                    <span className="label-text">Paid to</span>
                </div>
                <select name="to_person_id" defaultValue="" value={payment.to_person_id ? payment.to_person_id : ""} className="select select-bordered" onChange={handleStringInputChange}>
                    <option value="" disabled> Who received? </option>
                    {persons.map((person) => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                </select>

                <div className="label">
                    <span className="label-text">Amount</span>
                </div>
                <input
                    type="number"
                    name="amount"
                    step="0.01"
                    placeholder="Amount"
                    className="input input-bordered w-full max-w-sm"
                    value={payment.amount}
                    onChange={handleNumberInputChange}
                />

                <div className="label">
                    <span className="label-text">Payment date</span>
                </div>
                <input
                    type="date"
                    name="date"
                    value={payment.date?.toISOString().split('T')[0]}
                    className="input input-bordered w-full max-w-sm"
                    onChange={handleDateInputChange}
                />

                <div className="label">
                    <span className="label-text">Notes</span>
                </div>
                <input
                    type="text"
                    name="notes"
                    value={payment.notes}
                    className="input input-bordered w-full max-w-sm"
                    onChange={handleStringInputChange}
                />

                <button type="submit" className="btn btn-primary m-5" onClick={handleSubmit}>Submit</button>
            </label>
        </div>
    )
}