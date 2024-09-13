import {DEFAULT_PURCHASE_PAGE_SIZE, TABLE_NAMES, UPSERT_PURCHASE_WITH_DETAILS} from "@component/pages/api/constants";
import {Purchase, PurchaseDetail, PurchaseDetailShare, PurchaseUpsert} from "@component/models/purchase";
import {createSupabaseClient} from "@component/pages/api/lib/supabase";

export default {
    getPurchases,
    getPurchaseById,
    getAllPurchaseDetailSharesByPurchaseId,
    getPurchaseDetailsById,
    upsertPurchase,
    deletePurchaseById,
}

async function getPurchases(page: number = 1, pageSize: number = DEFAULT_PURCHASE_PAGE_SIZE): Promise<{ purchases: Purchase[], totalPages: number }> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await createSupabaseClient()
        .from(TABLE_NAMES.PURCHASE)
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(start, end);

    if (error) {
        console.error('Error fetching purchases:', error);
        throw new Error(`Failed to fetch purchases: ${error.message}`);
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 1;

    return {
        purchases: data || [],
        totalPages: totalPages,
    };
}

async function getPurchaseById(purchaseId: string): Promise<Purchase> {
    const { data, error } = await createSupabaseClient()
        .from(TABLE_NAMES.PURCHASE)
        .select('*')
        .eq('id', purchaseId)
        .single();

    if (error) {
        console.error('Error fetching purchase by ID:', error);
        throw new Error(`Failed to fetch purchase by ID: ${error.message}`);
    }

    if (!data) {
        throw new Error(`Purchase with ID ${purchaseId} not found`);
    }


    return data;
}

async function getAllPurchaseDetailSharesByPurchaseId(purchaseId: string): Promise<PurchaseDetailShare[]> {
    const { data, error } = await createSupabaseClient()
        .from(TABLE_NAMES.PURCHASE_DETAIL_PERSON)
        .select(`
            id,
            share_rate,
            person_id,
            purchase_detail_id,
            purchase_detail (
                purchase_id
            )
        `)
        .eq('purchase_detail.purchase_id', purchaseId);

    if (error) {
        console.error('Error fetching purchase detail shares:', error);
        throw new Error(`Failed to fetch purchase detail shares: ${error.message}`);
    }

    return data || [];
}

async function getPurchaseDetailsById(purchaseId: string): Promise<PurchaseDetail[]> {
    const { data, error } = await createSupabaseClient()
        .from(TABLE_NAMES.PURCHASE_DETAIL)
        .select('*')
        .eq('purchase_id', purchaseId);

    if (error) {
        console.error('Error fetching purchase details:', error);
        throw new Error(`Failed to fetch purchase details: ${error.message}`);
    }

    // calculate total prices
    if (data === null) {
        console.error('No purchase details found for purchase ID:', purchaseId);
        return [];
    }
    return data;
}

async function upsertPurchase(purchase: PurchaseUpsert): Promise<String> {
    const { data, error } = await createSupabaseClient().rpc(UPSERT_PURCHASE_WITH_DETAILS, {
        p_id: purchase.id,
        p_name: purchase.name,
        p_date: purchase.date,
        p_total_amount: purchase.total_amount,
        p_paid_by: purchase.paid_by,
        p_store: purchase.store,
        p_details: purchase.purchase_details,
    })

    if (error) {
        console.error('Error upserting purchase:', error);
        throw new Error(`Failed to upsert purchase: ${error.message}`);
    }

    return data.id;
}

async function deletePurchaseById(purchaseId: string): Promise<void> {
    const { error } = await createSupabaseClient()
        .from(TABLE_NAMES.PURCHASE)
        .delete()
        .eq('id', purchaseId);

    if (error) {
        console.error('Error deleting purchase:', error);
        throw new Error(`Failed to delete purchase: ${error.message}`);
    }
}