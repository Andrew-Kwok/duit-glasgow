// src/components/PersonList.tsx
import React, {useContext} from 'react';
import {PersonContext} from "@component/context/PersonContext";
import {TranslateBalanceTableToPayFlows} from "@component/utils/common";

export default function PersonList() {
    const { persons } = useContext(PersonContext);
    const payFlows = TranslateBalanceTableToPayFlows(persons);

    return (
        <div className="hero bg-base-100 min-h-fit">
            <div className="hero-content flex w-full flex-col lg:flex-row items-start">
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {persons.map((person, index) => (
                                <tr key={person.id}>
                                    <td>{index + 1}</td>
                                    <td>{person.name}</td>
                                    <td>{person.balance.toFixed(2)}</td>
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
