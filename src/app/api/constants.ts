export const TABLE_NAMES = {
    PERSON: 'person',
    PURCHASE: 'purchase',
    PURCHASE_DETAIL: 'purchase_detail',
    PURCHASE_DETAIL_PERSON: 'purchase_detail_person',
    PAYMENT: 'payment',
    CURRENCY: 'currency',
    ID_BALANCE_MAP: 'id_balance_map',
};

export const CURRENCIES = ['CAD', 'USD', 'IDR', 'BRL', 'CLP', 'MXN', 'PEN'];

export const ADD_BALANCES_BY_DELTA = 'add_balances_by_delta'
export const UPSERT_PURCHASE_WITH_DETAILS = 'upsert_purchase_with_details'
export const HARD_REFRESH_BALANCES = 'hard_refresh_balances'

export const DEFAULT_PURCHASE_PAGE_SIZE = 11;
export const DEFAULT_PAYMENT_PAGE_SIZE = 15;
