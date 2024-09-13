CREATE OR REPLACE FUNCTION upsert_purchase_with_details(
    p_id UUID,
    p_name VARCHAR,
    p_date DATE,
    p_total_amount DECIMAL(16, 8),
    p_paid_by UUID,
    p_store VARCHAR,
    p_details JSONB
)
RETURNS UUID AS $$
DECLARE
    detail RECORD;
    share RECORD;
    detail_ids UUID[] := ARRAY[]::UUID[];
    new_purchase_id UUID;
    new_purchase_detail_id UUID;
BEGIN
    -- Upsert the purchase record
    INSERT INTO purchase (id, name, date, total_amount, paid_by, store, created_at, updated_at)
    VALUES (COALESCE(p_id, gen_random_uuid()), p_name, p_date, p_total_amount, p_paid_by, p_store, timezone('utc-4', now()), timezone('utc-4', now()))
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        date = EXCLUDED.date,
        total_amount = EXCLUDED.total_amount,
        paid_by = EXCLUDED.paid_by,
        store = EXCLUDED.store,
        updated_at = EXCLUDED.updated_at
    RETURNING id INTO new_purchase_id;

    -- Loop through the details JSONB array to upsert details and related persons
    FOR detail IN SELECT * FROM jsonb_to_recordset(p_details)
        AS (item_name VARCHAR, quantity INT, price DECIMAL(16, 8), tax_rate DECIMAL(16, 8), detail_id UUID, shares JSONB)
    LOOP
        -- Upsert purchase_detail
        INSERT INTO purchase_detail (id, purchase_id, item_name, quantity, price, tax_rate, created_at, updated_at)
        VALUES (COALESCE(detail.detail_id, gen_random_uuid()), new_purchase_id, detail.item_name, detail.quantity, detail.price, detail.tax_rate, timezone('utc-4', now()), timezone('utc-4', now()))
        ON CONFLICT (id) DO UPDATE SET
            item_name = EXCLUDED.item_name,
            quantity = EXCLUDED.quantity,
            price = EXCLUDED.price,
            tax_rate = EXCLUDED.tax_rate,
            updated_at = EXCLUDED.updated_at
        RETURNING id INTO new_purchase_detail_id;
        detail_ids := array_append(detail_ids, new_purchase_detail_id);

        -- delete from purchase_detail_person with purchase_detail_id = new_purchase_detail_id
        DELETE FROM purchase_detail_person
        WHERE purchase_detail_id = new_purchase_detail_id;

        -- Loop through the persons JSONB array to insert purchase_detail_person records
        FOR share IN SELECT * FROM jsonb_to_recordset(detail.shares) AS (person_id UUID, share_rate DECIMAL(16, 8))
        LOOP
            INSERT INTO purchase_detail_person (purchase_detail_id, person_id, share_rate)
            VALUES (new_purchase_detail_id, share.person_id, share.share_rate);
        END LOOP;

    END LOOP;

    -- Delete any purchase_detail records that are not included in the upsert
    DELETE FROM purchase_detail
    WHERE purchase_id = new_purchase_id
    AND id NOT IN (SELECT UNNEST(detail_ids));

    RETURN new_purchase_id;
END;
$$ LANGUAGE plpgsql;
