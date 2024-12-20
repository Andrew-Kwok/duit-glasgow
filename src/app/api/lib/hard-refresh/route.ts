import { HARD_REFRESH_BALANCES } from "@component/app/api/constants";
import { createSupabaseClient } from "@component/app/api/lib/supabase";
import { NextResponse } from "next/server";
import {checkAuth} from "@component/app/api/lib/authCheck";

export async function POST() {
    const sessionCheck = await checkAuth();
    if (sessionCheck instanceof NextResponse) {
        return sessionCheck;
    }

    try {
        await createSupabaseClient().rpc(HARD_REFRESH_BALANCES);
        return NextResponse.json({message: "Balances refreshed successfully."}, {status: 200});
    } catch (error: any) {
        console.error("Error calling hard refresh balances:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}