import {Purchase, PurchaseDetail, PurchaseDetailShare, PurchaseUpsert} from "@component/models/purchase";
import {DEFAULT_PURCHASE_PAGE_SIZE} from "@component/app/api/constants";
import PersonService from "@component/app/api/person/service";
import PurchaseSql from "@component/app/api/purchase/sql";
import {calculateTotalAmount, calculateTotalPrices} from "@component/lib/purchase";
import {addDelta, Currency, flattenDelta} from "@component/app/api/lib/util";


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
    const deltas = new Map<string, Map<string, number>>();
    if (purchase.id) {
        // remove contribution from old purchase
        const oldPurchase = await fetchCompletePurchaseById(purchase.id);

        for (const d of oldPurchase.purchase_details) {
            addDelta(deltas, oldPurchase.paid_by, oldPurchase.currency, -d.total_price);

            for (const share of d.shares || []) {
                const shareAmount = d.total_price * share.share_rate;
                addDelta(deltas, share.person_id, oldPurchase.currency, shareAmount);
            }
        }
    }

    // add contribution from new purchase
    for (const purchaseDetail of purchase.purchase_details) {
        addDelta(deltas, purchase.paid_by, purchase.currency, purchaseDetail.total_price)

        for (const share of purchaseDetail.shares || []) {
            const shareAmount = purchaseDetail.total_price * share.share_rate;
            addDelta(deltas, share.person_id, purchase.currency, -shareAmount);
        }
    }

    // create new purchase with details in database
    await PurchaseSql.upsertPurchase(purchase);

    // update balances in database
    await PersonService.addBalancesByDelta(flattenDelta(deltas));
}

async function deletePurchaseById(purchaseId: string): Promise<void> {
    const deltas = new Map<string, Map<string, number>>();

    const purchase = await fetchCompletePurchaseById(purchaseId);
    if (purchase) {
        for (const d of purchase.purchase_details) {
            addDelta(deltas, purchase.paid_by, purchase.currency, -d.total_price);

            for (const share of d.shares || []) {
                const shareAmount = d.total_price * share.share_rate;
                addDelta(deltas, share.person_id, purchase.currency, shareAmount);
            }
        }

    }

    await PurchaseSql.deletePurchaseById(purchaseId);
    await PersonService.addBalancesByDelta(flattenDelta(deltas));
}