import { HARD_REFRESH_BALANCES } from "@component/app/api/constants";
import { createSupabaseClient } from "@component/app/api/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { code } = await req.json();
    if (code !== process.env.UPDATE_DATABASE_CODE) {
        return NextResponse.json({ error: "Invalid or missing code" }, {status: 403});
    }

    try {
        await createSupabaseClient().rpc(HARD_REFRESH_BALANCES);
        return NextResponse.json({message: "Balances refreshed successfully."}, {status: 200});
    } catch (error: any) {
        console.error("Error calling hard refresh balances:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}