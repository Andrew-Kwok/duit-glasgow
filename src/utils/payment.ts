import {PaymentUpsert} from "@component/models/payment";

export function constructNewPaymentCreate(): PaymentUpsert {
    return {
        id: null,
        from_person_id: null,
        to_person_id: null,
        amount: 0,
        date: null,
        notes: ''
    };
}

export function constructPaymentCreateFromPayment(payment: PaymentUpsert): PaymentUpsert {
    return {
        id: payment.id,
        from_person_id: payment.from_person_id,
        to_person_id: payment.to_person_id,
        amount: payment.amount,
        date: new Date(payment.date as string),
        notes: payment.notes
    };
}

export function validatePaymentUpsert(payment: PaymentUpsert): void {
    if (!payment.from_person_id) {
        throw new Error('From person is required');
    }

    if (!payment.to_person_id) {
        throw new Error('To person is required');
    }

    if (payment.from_person_id === payment.to_person_id) {
        throw new Error('From person and to person must be different');
    }

    if (payment.amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    if (!payment.date) {
        throw new Error('Date is required');
    }
}