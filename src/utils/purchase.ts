import {Purchase, PurchaseDetail, PurchaseDetailUpsert, PurchaseUpsert} from "@component/models/purchase";
import {Person} from "@component/models/person";

export function calculateTotalPrices(purchaseDetails: PurchaseDetail[]): void {
    for (const purchaseDetail of purchaseDetails) {
        purchaseDetail.total_price = purchaseDetail.price * purchaseDetail.quantity * (1 + purchaseDetail.tax_rate / 100);
    }
}

export function calculateTotalAmount(purchaseDetails: PurchaseDetail[]): number {
    return purchaseDetails.reduce((total, purchaseDetail) => total + purchaseDetail.total_price, 0);
}

export function validatePurchaseCreate(purchase: PurchaseUpsert): void {
    if (!purchase.name || purchase.name.trim() === "") {
        throw new Error('Name must not be empty');
    }

    if (!purchase.store || purchase.store.trim() === "") {
        throw new Error('Store must not be empty');
    }

    if (!purchase.date) {
        throw new Error('Date must not be empty');
    }

    if (!purchase.paid_by || purchase.paid_by.trim() === "") {
        throw new Error('Paid by must not be empty');
    }

    if (purchase.purchase_details.length === 0) {
        throw new Error('At least one purchase detail is required');
    }

    for (const purchaseDetail of purchase.purchase_details) {
        if (!purchaseDetail.item_name || purchaseDetail.item_name.trim() === "") {
            throw new Error('Item name must not be empty');
        }

        if (purchaseDetail.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        if (purchaseDetail.price <= 0) {
            throw new Error('Price must be greater than 0');
        }

        if (purchaseDetail.tax_rate < 0) {
            throw new Error('Tax rate must be greater than or equal to 0');
        }

        if (purchaseDetail.shares_boolean.every(share => !share)) {
            throw new Error('At least one person must buy this item');
        }
    }
}

export function populatePurchaseDetailShares(purchaseCreate: PurchaseUpsert, persons: Person[]): void {
    for (const purchaseDetail of purchaseCreate.purchase_details) {
        let shareCount = 0;
        if (purchaseDetail.shares_boolean[0]) {
            shareCount = persons.length;
        } else {
            shareCount = purchaseDetail.shares_boolean.filter(share => share).length;
        }

        let purchaseDetailShares = []
        for (let i = 0; i < persons.length; i++) {
            if (purchaseDetail.shares_boolean[0] || purchaseDetail.shares_boolean[i+1]) {
                purchaseDetailShares.push({
                    person_id: persons[i].id,
                    share_rate: 1 / shareCount
                });
            }
        }
        purchaseDetail.shares = purchaseDetailShares;
    }
}

export function constructNewPurchaseCreate(persons: Person[]): PurchaseUpsert {
    return {
        id: null,
        name: '',
        date: null,
        total_amount: 0,
        paid_by: '',
        store: '',
        purchase_details: [constructNewPurchaseDetailCreate(persons)]
    }
}

export function constructNewPurchaseDetailCreate(persons: Person[]): PurchaseDetailUpsert {
    return {
        id: null,
        item_name: '',
        quantity: 0,
        price: 0,
        tax_rate: 0,
        total_price: 0,
        shares: null,
        shares_boolean: new Array<boolean>(persons.length + 1).fill(false),
    }
}

export function constructDuplicatePurchaseCreateFromPurchase(purchase: Purchase, persons: Person[]): PurchaseUpsert {
    return {
        id: null,
        name: purchase.name,
        date: null,
        total_amount: purchase.total_amount,
        paid_by: purchase.paid_by,
        store: purchase.store,
        purchase_details: purchase.purchase_details.map(detail => ({
            id: null,
            item_name: detail.item_name,
            quantity: detail.quantity,
            price: detail.price,
            tax_rate: detail.tax_rate,
            total_price: detail.total_price,
            shares: null,
            shares_boolean: [false, ...persons.map(person =>
                detail.shares.some(share => share.person_id === person.id)
            )]
        }))
    };
}

export function constructPurchaseCreateFromPurchase(purchase: Purchase, persons: Person[]): PurchaseUpsert {
    return {
        id: purchase.id,
        name: purchase.name,
        date: new Date(purchase.date as string),
        total_amount: purchase.total_amount,
        paid_by: purchase.paid_by,
        store: purchase.store,
        purchase_details: purchase.purchase_details.map(detail => ({
            id: detail.id,
            item_name: detail.item_name,
            quantity: detail.quantity,
            price: detail.price,
            tax_rate: detail.tax_rate,
            total_price: detail.total_price,
            shares: detail.shares.map(share => ({
                purchase_detail_id: share.purchase_detail_id,
                person_id: share.person_id,
                share_rate: share.share_rate
            })),
            shares_boolean: [false, ...persons.map(person =>
                detail.shares.some(share => share.person_id === person.id)
            )]
        }))
    };
}
