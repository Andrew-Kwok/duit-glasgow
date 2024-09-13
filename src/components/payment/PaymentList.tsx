import React, {useContext, useEffect, useState} from "react";
import {PersonContext} from "@component/context/PersonContext";
import {Payment} from "@component/models/payment";
import PaymentUpsertForm from "@component/components/payment/PaymentUpsertForm";
import {constructNewPaymentCreate, constructPaymentCreateFromPayment} from "@component/utils/payment";
import {useRouter} from "next/router";
import {DEFAULT_PAYMENT_PAGE_SIZE} from "@component/pages/api/constants";
import {GetPersonMapFromPersons} from "@component/utils/common";

export default function PaymentList() {
    const router = useRouter();

    const { persons } = useContext(PersonContext);
    const personMap = GetPersonMapFromPersons(persons);

    const [paymentList, setPaymentList] = useState<Payment[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleDeleteButtonClick = async (id: string, paymentNo: number) => {
        const confirmationCode = prompt(`Please enter the confirmation code to delete payment ${paymentNo}:`);
        if (!confirmationCode) {
            alert('Confirmation code is required');
            return;
        }

        try {
            await fetch(`/api/payment/delete?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({code: confirmationCode}),
            })

            alert(`Payment ${paymentNo} deleted successfully`);
            router.reload();
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error deleting payment:', error);
                alert(`Failed to delete payment: ${error.message}`);
            } else {
                console.error('Unexpected error:', error);
                alert('Failed to refresh balances: Unknown error');
            }
        }
    }



    useEffect(() => {
        const loadPayments = async () => {
            try {
                const response = await fetch(`/api/payment/getByPagination?page=${currentPage}`);
                const { payments, totalPages } = await response.json();
                setPaymentList(payments);
                setTotalPages(totalPages);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('Unknown error');
                }
            } finally {
                setLoading(false);
            }
        };

        loadPayments();
    }, [currentPage]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="m-8 w-full">
            <div className="flex">
                <h1 className="text-3xl font-bold"> Recent Payments </h1>
                <button
                    className="btn btn-primary mx-4"
                    onClick={() => {
                        const modal = document.getElementById("modal_payment_create");
                        if (modal) {
                            (modal as HTMLDialogElement).showModal();
                        } else {
                            console.error('Modal element not found');
                        }
                    }}
                >
                    Add payments
                </button>

                <dialog id="modal_payment_create" className="modal">
                    <div className="modal-box max-w-screen-md">
                        <h1 className="text-xl font-bold"> Add New Payment </h1>
                        <div className="flex justify-center">
                            <PaymentUpsertForm initialPaymentUpsert={constructNewPaymentCreate()} />
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
            </div>

            <div className="flex justify-center">
                <table className="table table-zebra overflow-x-auto max-w-screen-2xl">
                    <thead>
                    <tr>
                        <th>Delete</th>
                        <th>Edit</th>
                        <th>No</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Notes</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paymentList.map((payment, index) => (
                        <tr key={index}>
                            <td>
                                <button type="button" className="btn btn-ghost" onClick={() => handleDeleteButtonClick(payment.id, (currentPage - 1) * DEFAULT_PAYMENT_PAGE_SIZE + index + 1)}>
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
                            <td>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        const modal = document.getElementById(`modal_payment_update_${index}`);
                                        if (modal) {
                                            (modal as HTMLDialogElement).showModal();
                                        } else {
                                            console.error('Modal element not found');
                                        }
                                    }}
                                >
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
                                            d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                                        />
                                    </svg>
                                </button>

                                <dialog id={`modal_payment_update_${index}`} className="modal">
                                    <div className="modal-box max-w-screen-md">
                                        <h1 className="text-xl font-bold"> Add New Payment </h1>
                                        <div className="flex justify-center">
                                            <PaymentUpsertForm initialPaymentUpsert={constructPaymentCreateFromPayment(payment)} />
                                        </div>
                                    </div>
                                    <form method="dialog" className="modal-backdrop">
                                        <button>close</button>
                                    </form>
                                </dialog>
                            </td>
                            <td>{(currentPage - 1) * DEFAULT_PAYMENT_PAGE_SIZE + index + 1}</td>
                            <td>{personMap.get(payment.from_person_id)?.name}</td>
                            <td>{personMap.get(payment.to_person_id)?.name}</td>
                            <td>{payment.amount.toFixed(2)}</td>
                            <td>{payment.date.toString()}</td>
                            <td>{payment.notes}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-8">
                <div className="join">
                    <button className="join-item btn" disabled={currentPage === 1} onClick={handlePreviousPage}>«</button>
                    <button className="join-item btn">Page {currentPage} / {totalPages}</button>
                    <button className="join-item btn" disabled={currentPage === totalPages} onClick={handleNextPage}>»</button>
                </div>
            </div>
        </div>
    );
}