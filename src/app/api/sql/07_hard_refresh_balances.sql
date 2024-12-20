CREATE OR REPLACE FUNCTION hard_refresh_balances()
RETURNS VOID AS $$
BEGIN
  -- calculate and update total_amount for each purchase_id
  TRUNCATE TABLE id_balance_map;

  INSERT INTO id_balance_map (id, balance)
  SELECT
    purchase.id AS id,
    COALESCE(SUM(purchase_detail.quantity * purchase_detail.price * (1 + purchase_detail.tax_rate / 100)), 0) AS balance
  FROM
    purchase
    LEFT JOIN purchase_detail ON purchase.id = purchase_detail.purchase_id
  GROUP BY
    purchase.id;

  UPDATE purchase
  SET total_amount = id_balance_map.balance
  FROM id_balance_map
  WHERE purchase.id = id_balance_map.id;

  -- calculate and update balance for each person_id
  TRUNCATE TABLE id_balance_map;

  INSERT INTO id_balance_map (id, balance)
  SELECT
    share.person_id AS id,
    COALESCE(SUM(
      -purchase_detail.quantity * purchase_detail.price * (1 + purchase_detail.tax_rate / 100) * (share.share_rate)
    ), 0) AS balance
  FROM
    purchase_detail
    LEFT JOIN purchase_detail_person share ON purchase_detail.id = share.purchase_detail_id
  GROUP BY
    share.person_id;

  INSERT INTO id_balance_map (id, balance)
  SELECT paid_by AS id, SUM(total_amount) AS balance
  FROM purchase
  GROUP BY paid_by
  ON CONFLICT (id) DO UPDATE
    SET balance = id_balance_map.balance + EXCLUDED.balance;

  INSERT INTO id_balance_map (id, balance)
  SELECT from_person_id AS id, SUM(amount) AS balance
  FROM payment
  GROUP BY from_person_id
  ON CONFLICT (id) DO UPDATE
    SET balance = id_balance_map.balance + EXCLUDED.balance;

  INSERT INTO id_balance_map (id, balance)
  SELECT to_person_id AS id, SUM(-amount) AS balance
  FROM payment
  GROUP BY to_person_id
  ON CONFLICT (id) DO UPDATE
    SET balance = id_balance_map.balance + EXCLUDED.balance;


  UPDATE person
  SET balance = id_balance_map.balance
  FROM id_balance_map
  WHERE person.id = id_balance_map.id;

  -- clear table
  TRUNCATE TABLE id_balance_map;
END;
$$ LANGUAGE plpgsql;
