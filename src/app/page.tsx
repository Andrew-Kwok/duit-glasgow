import React from "react";

import PersonList from "@component/components/person/PersonList";
import PurchaseList from "@component/components/purchase/PurchaseList";
import PaymentList from "@component/components/payment/PaymentList";
import HardRefreshBalances from "@component/components/HardRefreshBalances";
import NavBar from "@component/components/NavBar";

export default function Home() {
    return (
        <div>
            {/*<a href="/api/auth/login">Login</a>*/}
            <PersonList />
            <PurchaseList />
            <PaymentList />
            <HardRefreshBalances />
        </div>
    );
}
