import {Payment, PaymentUpsert} from "@component/models/payment";
import PaymentSql from "@component/app/api/payment/sql";
import PersonService from "@component/app/api/person/service";
import {DEFAULT_PAYMENT_PAGE_SIZE} from "@component/app/api/constants";
import {addDelta, flattenDelta} from "@component/app/api/lib/util";

export default {
    fetchPayments,
    upsertPayment,
    deletePaymentById,
}

async function fetchPayments(page: number = 1, pageSize: number = DEFAULT_PAYMENT_PAGE_SIZE): Promise<{ payments: Payment[], totalPages: number }> {
    return await PaymentSql.getPayments(page, pageSize);
}

async function upsertPayment(payment: PaymentUpsert): Promise<void> {
    if (!payment.from_person_id) {
        throw new Error('Sender is required');
    }
    if (!payment.to_person_id) {
        throw new Error('Receiver is required');
    }

    const deltas = new Map<string, Map<string, number>>();
    if (payment.id) {
        const oldPayment = await PaymentSql.getPaymentById(payment.id);

        addDelta(deltas, oldPayment.from_person_id, oldPayment.currency, -oldPayment.amount);
        addDelta(deltas, oldPayment.to_person_id, oldPayment.currency, oldPayment.amount);
    }

    addDelta(deltas, payment.from_person_id, payment.currency, payment.amount);
    addDelta(deltas, payment.to_person_id, payment.currency, -payment.amount);

    await PaymentSql.upsertPayment(payment);
    await PersonService.addBalancesByDelta(flattenDelta(deltas));
}

async function deletePaymentById(paymentId: string): Promise<void> {
    const deltas = new Map<string, Map<string, number>>();

    const oldPayment = await PaymentSql.getPaymentById(paymentId);
    addDelta(deltas, oldPayment.from_person_id, oldPayment.currency, -oldPayment.amount);
    addDelta(deltas, oldPayment.to_person_id, oldPayment.currency, oldPayment.amount);

    await PaymentSql.deletePaymentById(paymentId);
    await PersonService.addBalancesByDelta(flattenDelta(deltas));
}