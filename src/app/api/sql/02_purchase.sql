CREATE TABLE IF NOT EXISTS purchase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    total_amount DECIMAL(16, 8) NOT NULL,
    paid_by UUID REFERENCES person (id) ON DELETE RESTRICT,
    store VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT timezone('utc-4', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc-4', now())
);
