CREATE TABLE IF NOT EXISTS payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_person_id UUID REFERENCES person (id) ON DELETE RESTRICT,
    to_person_id UUID REFERENCES person (id) ON DELETE RESTRICT,
    amount DECIMAL(16, 8) NOT NULL,
    notes VARCHAR(255),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc-4', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc-4', now())
);