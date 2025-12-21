"use client";

// src/components/PersonList.tsx
import React, {useContext, useState} from 'react';
import {PersonContext} from "@component/context/PersonContext";
import {TranslateBalanceTableToPayFlows} from "@component/lib/common";
import {useSession} from "next-auth/react";
import {CURRENCIES} from "@component/app/api/constants";

export default function PersonList() {
    const { persons } = useContext(PersonContext);
    const [selectedCurrency, setSelectedCurrency] = useState('CAD');
    const payFlows = TranslateBalanceTableToPayFlows(persons);

    return (
        <div className="hero bg-base-100 min-h-screen">
            <div className="hero-content flex w-full flex-col lg:flex-row items-center lg:items-start">
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>
                                    Balance
                                    <select
                                      className="select select-bordered select-xs mx-2"
                                      value={selectedCurrency}
                                      onChange={(e) => setSelectedCurrency(e.target.value)}
                                    >
                                        {CURRENCIES.map(c => (
                                          <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {persons.map((person, index) => (
                                <tr key={person.id}>
                                    <td>{index + 1}</td>
                                    <td>{person.name}</td>
                                    <td>
                                        {(() => {
                                            const b = person.balances.find(
                                              (bal) => bal.currency === selectedCurrency
                                            );
                                            return b
                                              ? `${selectedCurrency} ${b.balance.toFixed(2)}`
                                              : `${selectedCurrency} 0.00`;
                                        })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="divider lg:divider-horizontal" />
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                        <tr>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {payFlows.map((payFlow, index) => (
                            <tr key={index}>
                                <td>{payFlow}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
