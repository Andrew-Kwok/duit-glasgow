import { NextResponse } from "next/server";
import { checkAuth } from "@component/app/api/lib/authCheck";
import PaymentService from "@component/app/api/payment/service";
import {DEFAULT_PAYMENT_PAGE_SIZE} from "@component/app/api/constants";

export async function GET(req: Request) {
    const sessionCheck = await checkAuth();
    if (sessionCheck instanceof NextResponse) {
        return sessionCheck;
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSizeParam = searchParams.get('pageSize');
    const pageSize = pageSizeParam ? parseInt(pageSizeParam) : DEFAULT_PAYMENT_PAGE_SIZE;

    try {
        const { payments, totalPages } = await PaymentService.fetchPayments(page, pageSize);
        return NextResponse.json({ payments, totalPages }, {status: 200});
    } catch (error: any) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}

export async function POST(req: Request) {
    const sessionCheck = await checkAuth();
    if (sessionCheck instanceof NextResponse) {
        return sessionCheck;
    }

    const { payment } = await req.json();

    try {
        await PaymentService.upsertPayment(payment);
        return NextResponse.json({ message: "Payment upserted successfully" }, {status: 200});
    } catch (error: any) {
        console.error('Error upserting payment:', error);
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
        await PaymentService.deletePaymentById(id);
        return NextResponse.json({ message: 'Payment deleted successfully' }, {status: 200});
    } catch (error: any) {
        console.error('Error deleting payment:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}