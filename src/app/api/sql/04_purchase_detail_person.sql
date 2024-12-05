CREATE TABLE IF NOT EXISTS purchase_detail_person (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_detail_id UUID REFERENCES purchase_detail (id) ON DELETE CASCADE,
    person_id UUID REFERENCES Person (id) ON DELETE RESTRICT,
    share_rate DECIMAL(16, 8) DEFAULT 0 CHECK (share_rate >= 0 AND share_rate <= 100)
);
