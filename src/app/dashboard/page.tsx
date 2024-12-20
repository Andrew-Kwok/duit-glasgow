"use client";

import PersonList from "@component/components/person/PersonList";
import HardRefreshBalances from "@component/components/HardRefreshBalances";
import {useSession} from "next-auth/react";

export default function Dashboard() {
    return (
        <div>
            <PersonList />
            <HardRefreshBalances />
        </div>
    )
}