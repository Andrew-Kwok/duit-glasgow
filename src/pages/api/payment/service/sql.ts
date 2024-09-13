import {Payment, PaymentUpsert} from "@component/models/payment";
import {DEFAULT_PAYMENT_PAGE_SIZE, TABLE_NAMES} from "@component/pages/api/constants";
import {createSupabaseClient} from "@component/pages/api/lib/supabase";

export default {
    getPayments,
    getPaymentById,
    upsertPayment,
    deletePaymentById,
}

async function getPayments(page: number = 1, pageSize: number = DEFAULT_PAYMENT_PAGE_SIZE): Promise<{ payments: Payment[], totalPages: number }> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await createSupabaseClient()
        .from(TABLE_NAMES.PAYMENT)
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(start, end);

    if (error) {
        console.error('Error fetching payments:', error);
        throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 1;

    return {
        payments: data || [],
        totalPages: totalPages,
    };
}

async function getPaymentById(paymentId: string): Promise<Payment> {
    const { data, error } = await createSupabaseClient()
        .from(TABLE_NAMES.PAYMENT)
        .select('*')
        .eq('id', paymentId)
        .single();

    if (error) {
        console.error('Error fetching payment by ID:', error);
        throw new Error(`Failed to fetch payment by ID: ${error.message}`);
    }

    if (!data) {
        throw new Error(`Payment with ID ${paymentId} not found`);
    }

    return data;
}

async function upsertPayment(payment: PaymentUpsert): Promise<void> {
    console.log("UPSERT PAYMENT", payment)

    const { id, ...rest } = payment;
    const paymentPayload = id ? payment : rest;

    const { error } = await createSupabaseClient()
        .from(TABLE_NAMES.PAYMENT)
        .upsert([paymentPayload], { onConflict: 'id' });

    if (error) {
        console.error('Error upserting payment:', error);
        throw new Error(`Failed to upsert payment: ${error.message}`);
    }
}

async function deletePaymentById(paymentId: string): Promise<void> {
    const { error } = await createSupabaseClient()
        .from(TABLE_NAMES.PAYMENT)
        .delete()
        .eq('id', paymentId);

    if (error) {
        console.error('Error deleting payment:', error);
        throw new Error(`Failed to delete payment: ${error.message}`);
    }
}