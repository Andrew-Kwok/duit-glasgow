import {Purchase} from "@component/models/purchase";
import React, {useContext, useEffect, useState} from "react";
import PurchaseDetail from "@component/components/purchase/PurchaseDetail";
import Link from "next/link";
import {PersonContext} from "@component/context/PersonContext";
import {useRouter} from "next/router";
import {GetPersonMapFromPersons} from "@component/utils/common";

export default function PurchaseList() {
    const router = useRouter();

    const { persons } = useContext(PersonContext);
    const personMap = GetPersonMapFromPersons(persons);

    const [purchaseList, setPurchaseList] = useState<Purchase[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleUpdateButtonClick = (id: string) => {
        router.push(`/update/${id}`);
    }

    const handleDuplicateButtonClick = (id: string) => {
        router.push(`/create/${id}`);
    }

    const handleDeleteButtonClick = async (id: string, name: string) => {
        const confirmationCode = prompt(`Please enter the confirmation code to delete purchase ${name}:`);
        if (!confirmationCode) {
            alert('Confirmation code is required');
            return;
        }

        try {
            await fetch(`/api/purchase/delete?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: confirmationCode }),
            })

            alert(`Purchase ${name} deleted successfully`);
            router.reload();
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error deleting purchase:', error);
                alert(`Failed to delete purchase: ${error.message}`);
            } else {
                console.error('Unexpected error:', error);
                alert('Failed to refresh balances: Unknown error');
            }
        }
    }

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


    useEffect(() => {
        const loadPurchases = async () => {
            try {
                const response = await fetch(`/api/purchase/getByPagination?page=${currentPage}`);
                const { purchases, totalPages } = await response.json();
                setPurchaseList(purchases);
                setTotalPages(totalPages);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        loadPurchases();
    }, [currentPage]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="m-8">
            <h1 className="text-3xl font-bold"> Recent Purchases </h1>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(24rem,1fr))] gap-4 my-4 max-w-[100vw]">
                <div className="card bg-base-100 w-96 max-w-[100vw] shadow-xl">
                    <Link href="/create" className="card btn btn-primary w-full shadow-xl h-full justify-center items-center">
                        <h1 className="text-5xl tooltip" data-tip="add more purchases"> + </h1>
                    </Link>
                </div>

                {purchaseList.map((purchase, index) => (
                    <div className="card bg-base-100 w-96 max-w-[100w] shadow-xl" key={index}>
                        <div className="card-body">
                            <div className="flex text-right">
                                <h2 className="card-title"> {purchase.name} </h2>
                                <p className="italic"> {new Date(purchase.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', timeZone: 'UTC' })} </p>
                            </div>
                            <div className="flex justify-between">
                                <h3> {purchase.store} </h3>
                                <h3 className="font-bold"> payer: {personMap.get(purchase.paid_by)?.name} </h3>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold"> CAD {purchase.total_amount.toFixed(2)} </h1>
                            </div>

                            <div className="card-actions justify-end">
                                <button className="btn btn-primary" onClick={() => handleUpdateButtonClick(purchase.id)}>
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

                                <button className="btn btn-primary" onClick={() => handleDuplicateButtonClick(purchase.id)}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"
                                        />
                                    </svg>
                                </button>

                                <button type="button" className="btn btn-primary" onClick={() => handleDeleteButtonClick(purchase.id, purchase.name)}>
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

                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        const modal = document.getElementById(`"modal_${index}"`);
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
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>

                                <dialog id={`"modal_${index}"`}  className="modal">
                                    <div className="modal-box max-w-screen-lg">
                                        <PurchaseDetail purchaseId={purchase.id} personMap={personMap} />
                                    </div>
                                    <form method="dialog" className="modal-backdrop">
                                        <button>close</button>
                                    </form>
                                </dialog>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <div className="join">
                    <button className="join-item btn" disabled={currentPage === 1} onClick={handlePreviousPage}>«</button>
                    <button className="join-item btn">Page {currentPage} / {totalPages}</button>
                    <button className="join-item btn" disabled={currentPage === totalPages} onClick={handleNextPage}>»</button>
                </div>
            </div>
        </div>
    )
}