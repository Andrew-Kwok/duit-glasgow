export interface Payment {
    id: string;  // UUID
    from_person_id: string;  // UUID
    to_person_id: string;  // UUID
    amount: number;
    date: Date;
    notes: string;
    created_at: Date;
    updated_at: Date;
}

export interface PaymentUpsert {
    id: string | null;  // UUID
    from_person_id: string | null;  // UUID
    to_person_id: string | null;  // UUID
    amount: number;
    date: Date | null;
    notes: string;
}