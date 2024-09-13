import {Payment, PaymentUpsert} from "@component/models/payment";
import PaymentSql from "@component/pages/api/payment/service/sql";
import PersonService from "@component/pages/api/person/service/service";
import {DEFAULT_PAYMENT_PAGE_SIZE} from "@component/pages/api/constants";

export default {
    fetchPayments,
    upsertPayment,
    deletePaymentById,
}

async function fetchPayments(page: number = 1, pageSize: number = DEFAULT_PAYMENT_PAGE_SIZE): Promise<{ payments: Payment[], totalPages: number }> {
    return await PaymentSql.getPayments(page, pageSize);
}

async function upsertPayment(payment: PaymentUpsert): Promise<void> {
    const persons = await PersonService.getPersons();
    let oldPayment: Payment | null = null;
    if (payment.id) {
        oldPayment = await PaymentSql.getPaymentById(payment.id);
    }

    for (const person of persons) {
        if (person.id == payment.from_person_id) {
            if (oldPayment) {
                person.balance -= oldPayment.amount;
            }
            person.balance += payment.amount;
        } else if (person.id == payment.to_person_id) {
            if (oldPayment) {
                person.balance += oldPayment.amount;
            }
            person.balance -= payment.amount;
        }
    }

    await PaymentSql.upsertPayment(payment);
    await PersonService.updateBalances(persons);
}

async function deletePaymentById(paymentId: string): Promise<void> {
    const payment = await PaymentSql.getPaymentById(paymentId);
    const persons = await PersonService.getPersons();
    for (const person of persons) {
        if (person.id == payment.from_person_id) {
            person.balance -= payment.amount;
        } else if (person.id == payment.to_person_id) {
            person.balance += payment.amount;
        }
    }

    await PaymentSql.deletePaymentById(paymentId);
    await PersonService.updateBalances(persons);
}