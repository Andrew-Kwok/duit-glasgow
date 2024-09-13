export interface Purchase {
    id: string;  // UUID
    name: string;
    date: Date;
    total_amount: number;
    paid_by: string;
    store: string;
    purchase_details: PurchaseDetail[];
    created_at: Date;
    updated_at: Date;
}

export interface PurchaseDetail {
    id: string;  // UUID
    purchase_id: string;  // UUID
    product_id: string;  // UUID
    item_name: string;
    quantity: number;
    price: number;
    tax_rate: number;
    total_price: number;
    shares: PurchaseDetailShare[];
    created_at: Date;
    updated_at: Date;
}

export interface PurchaseDetailShare {
    purchase_detail_id: string;  // UUID
    person_id: string;  // UUID
    share_rate: number;
    created_at: Date;
    updated_at: Date;
}

export interface PurchaseUpsert {
    id: string | null;
    name: string;
    date: Date | null;
    total_amount: number;
    paid_by: string;
    store: string;
    purchase_details: PurchaseDetailUpsert[];
}

export interface PurchaseDetailUpsert {
    id: string | null;
    item_name: string;
    quantity: number;
    price: number;
    tax_rate: number;
    total_price: number;
    shares: PurchaseDetailShareUpsert[] | null;
    shares_boolean: boolean[];
}

export interface PurchaseDetailShareUpsert {
    purchase_detail_id: string | null;
    person_id: string;
    share_rate: number;
}