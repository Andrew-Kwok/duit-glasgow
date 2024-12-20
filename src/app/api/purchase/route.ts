import { NextResponse } from "next/server";
import PurchaseService from '@component/app/api/purchase/service';
import { DEFAULT_PURCHASE_PAGE_SIZE } from "@component/app/api/constants";
import {checkAuth} from "@component/app/api/lib/authCheck";

export async function GET(req: Request) {
    const sessionCheck = await checkAuth();
    if (sessionCheck instanceof NextResponse) {
        return sessionCheck;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // If ID is provided, Get purchase by ID
    if (id) {
        try {
            const purchase = await PurchaseService.fetchCompletePurchaseById(id);
            return NextResponse.json(purchase, {status: 200});
        } catch (error: any) {
            console.error('Error fetching complete purchase:', error);
            return NextResponse.json({ error: error.message }, {status: 500});
        }
    }

    // Otherwise, Get purchases by pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSizeParam = searchParams.get('pageSize');
    const pageSize = pageSizeParam ? parseInt(pageSizeParam) : DEFAULT_PURCHASE_PAGE_SIZE;

    try {
        const { purchases, totalPages } = await PurchaseService.fetchPurchases(page, pageSize);
        return NextResponse.json({ purchases, totalPages }, {status: 200});
    } catch (error: any) {
        console.error('Error fetching purchases:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}

export async function POST(req: Request) {
    const sessionCheck = await checkAuth();
    if (sessionCheck instanceof NextResponse) {
        return sessionCheck;
    }

    const { purchase } = await req.json();

    try {
        await PurchaseService.upsertPurchaseWithDetails(purchase);
        return NextResponse.json({ message: "Purchase upserted successfully" }, {status: 200});
    } catch (error: any) {
        console.error('Error upserting purchase:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}

export async function DELETE(req: Request) {
    const sessionCheck = await checkAuth();
    if (sessionCheck instanceof NextResponse) {
        return sessionCheck;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, {status: 400});
    }

    try {
        await PurchaseService.deletePurchaseById(id);
        return NextResponse.json({ message: 'Purchase deleted successfully' }, {status: 200});
    } catch (error: any) {
        console.error('Error deleting purchase:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}

