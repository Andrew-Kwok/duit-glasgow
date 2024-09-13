CREATE TABLE IF NOT EXISTS purchase_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchase (id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(16, 8) NOT NULL CHECK (price >= 0),
    tax_rate DECIMAL(16, 8) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc-4', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc-4', now())
);
