import { NextResponse } from "next/server";
import PurchaseService from '@component/app/api/purchase/service';
import { DEFAULT_PURCHASE_PAGE_SIZE } from "@component/app/api/constants";

export async function GET(req: Request) {
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
    const pageSize = parseInt(searchParams.get('pageSize') || DEFAULT_PURCHASE_PAGE_SIZE.toString());

    try {
        const { purchases, totalPages } = await PurchaseService.fetchPurchases(page, pageSize);
        return NextResponse.json({ purchases, totalPages }, {status: 200});
    } catch (error: any) {
        console.error('Error fetching purchases:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}

export async function POST(req: Request) {
    const { purchase, code } = await req.json();
    if (code !== process.env.UPDATE_DATABASE_CODE) {
        return NextResponse.json({ error: "Invalid or missing code" }, {status: 403});
    }

    try {
        await PurchaseService.upsertPurchaseWithDetails(purchase);
        return NextResponse.json({ message: "Purchase upserted successfully" }, {status: 200});
    } catch (error: any) {
        console.error('Error upserting purchase:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, {status: 400});
    }

    const { code } = await req.json();
    if (code !== process.env.UPDATE_DATABASE_CODE) {
        return NextResponse.json({error: "Invalid or missing code"}, {status: 403});
    }

    try {
        await PurchaseService.deletePurchaseById(id);
        return NextResponse.json({ message: 'Purchase deleted successfully' }, {status: 200});
    } catch (error: any) {
        console.error('Error deleting purchase:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}

