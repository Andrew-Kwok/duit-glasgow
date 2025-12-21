export interface Balance {
    person_id: string;  // UUID
    currency: string;
    balance: number;
}

export interface Person {
    id: string;  // UUID
    name: string;
    balance: number;
    balances: Balance[];
    created_at: Date;
    updated_at: Date;
}