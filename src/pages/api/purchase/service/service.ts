import {Purchase, PurchaseDetail, PurchaseDetailShare, PurchaseUpsert} from "@component/models/purchase";
import {DEFAULT_PURCHASE_PAGE_SIZE} from "@component/pages/api/constants";
import PersonService from "@component/pages/api/person/service/service";
import PurchaseSql from "@component/pages/api/purchase/service/sql";
import {calculateTotalAmount, calculateTotalPrices} from "@component/utils/purchase";


export default {
    fetchPurchases,
    fetchAllPurchaseDetailSharesByPurchaseId,
    fetchPurchaseDetailsById,
    fetchPurchaseDetailsByIdThenVerify,
    fetchCompletePurchaseById,
    upsertPurchaseWithDetails,
    deletePurchaseById
}

async function fetchPurchases(page: number = 1, pageSize: number = DEFAULT_PURCHASE_PAGE_SIZE): Promise<{ purchases: Purchase[], totalPages: number }> {
    return await PurchaseSql.getPurchases(page, pageSize);
}

async function fetchAllPurchaseDetailSharesByPurchaseId(purchaseId: string): Promise<PurchaseDetailShare[]> {
    return await PurchaseSql.getAllPurchaseDetailSharesByPurchaseId(purchaseId);
}

async function fetchPurchaseDetailsById(purchaseId: string): Promise<PurchaseDetail[]> {
    const purchaseDetails = await PurchaseSql.getPurchaseDetailsById(purchaseId);
    calculateTotalPrices(purchaseDetails);

    // retrieves shares for all purchase details and maps them to the purchase details
    const purchaseDetailShares = await fetchAllPurchaseDetailSharesByPurchaseId(purchaseId);
    const purchaseDetailSharesMapping = purchaseDetailShares.reduce((map, share) => {
        if (!map.has(share.purchase_detail_id)) {
            map.set(share.purchase_detail_id, []);
        }
        map.get(share.purchase_detail_id)!.push(share);
        return map;
    }, new Map<string, PurchaseDetailShare[]>);

    for (const purchaseDetail of purchaseDetails) {
        purchaseDetail.shares = purchaseDetailSharesMapping.get(purchaseDetail.id) || [];
    }

    return purchaseDetails;
}

async function fetchPurchaseDetailsByIdThenVerify(purchase: Purchase): Promise<PurchaseDetail[]> {
    const data = await fetchPurchaseDetailsById(purchase.id);

    const total_amount = calculateTotalAmount(data);
    if (purchase.total_amount !== total_amount) {
        console.error('Total amount mismatch for purchase ID:', purchase.id);
    }
    purchase.total_amount = total_amount;
    return data;
}

async function fetchCompletePurchaseById(purchaseId: string): Promise<Purchase> {
    const purchase = await PurchaseSql.getPurchaseById(purchaseId);
    purchase.purchase_details = await fetchPurchaseDetailsById(purchaseId);
    purchase.total_amount = calculateTotalAmount(purchase.purchase_details);
    return purchase;
}

async function upsertPurchaseWithDetails(purchase: PurchaseUpsert): Promise<void> {
    const persons = await PersonService.getPersons();
    let oldPurchase: Purchase | null = null;
    if (purchase.id) {
        oldPurchase = await fetchCompletePurchaseById(purchase.id);
    }

    // calculate new balances
    let newPersonBalance = persons.reduce((map, person) => {
        map.set(person.id, person.balance);
        return map;
    }, new Map<string, number>());

    // remove contribution from old purchase
    if (oldPurchase) {
        for (const purchaseDetail of oldPurchase.purchase_details) {
            const paidByBalance = newPersonBalance.get(oldPurchase.paid_by) ?? 0;
            newPersonBalance.set(oldPurchase.paid_by, paidByBalance - purchaseDetail.total_price);

            for (const share of purchaseDetail.shares || []) {
                const shareAmount = purchaseDetail.total_price * share.share_rate;
                const personBalance = newPersonBalance.get(share.person_id) ?? 0;
                newPersonBalance.set(share.person_id, personBalance + shareAmount);
            }
        }
    }

    for (const purchaseDetail of purchase.purchase_details) {
        const paidByBalance = newPersonBalance.get(purchase.paid_by) ?? 0;
        newPersonBalance.set(purchase.paid_by, paidByBalance + purchaseDetail.total_price);
        for (const share of purchaseDetail.shares || []) {
            const shareAmount = purchaseDetail.total_price * share.share_rate;
            const personBalance = newPersonBalance.get(share.person_id) ?? 0;
            newPersonBalance.set(share.person_id, personBalance - shareAmount);
        }
    }

    // create new purchase with details in database
    await PurchaseSql.upsertPurchase(purchase);

    // update balances in database
    await PersonService.updateBalancesWithMap(newPersonBalance);
}

async function deletePurchaseById(purchaseId: string): Promise<void> {
    const persons = await PersonService.getPersons();

    const purchase = await fetchCompletePurchaseById(purchaseId);
    let newPersonBalance = persons.reduce((map, person) => {
        map.set(person.id, person.balance);
        return map;
    }, new Map<string, number>());

    for (const purchaseDetail of purchase.purchase_details) {
        const paidByBalance = newPersonBalance.get(purchase.paid_by) ?? 0;
        newPersonBalance.set(purchase.paid_by, paidByBalance - purchaseDetail.total_price);
        for (const share of purchaseDetail.shares) {
            const shareAmount = purchaseDetail.total_price * share.share_rate;
            const personBalance = newPersonBalance.get(share.person_id) ?? 0;
            newPersonBalance.set(share.person_id, personBalance + shareAmount);
        }
    }

    await PurchaseSql.deletePurchaseById(purchaseId);
    await PersonService.updateBalancesWithMap(newPersonBalance);
}