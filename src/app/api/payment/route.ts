import { NextResponse } from "next/server";
import PaymentService from "@component/app/api/payment/service";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    try {
        const { payments, totalPages } = await PaymentService.fetchPayments(page, pageSize);
        return NextResponse.json({ payments, totalPages }, {status: 200});
    } catch (error: any) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}

export async function POST(req: Request) {
    const { payment, code } = await req.json();
    if (code !== process.env.UPDATE_DATABASE_CODE) {
        return NextResponse.json({ error: "Invalid or missing code" }, {status: 403});
    }

    try {
        await PaymentService.upsertPayment(payment);
        return NextResponse.json({ message: "Payment upserted successfully" }, {status: 200});
    } catch (error: any) {
        console.error('Error upserting payment:', error);
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
        await PaymentService.deletePaymentById(id);
        return NextResponse.json({ message: 'Payment deleted successfully' }, {status: 200});
    } catch (error: any) {
        console.error('Error deleting payment:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}