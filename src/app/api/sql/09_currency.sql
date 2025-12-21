create table public.currency (
  code varchar(3) primary key,
  constraint currency_code_upper check (code = upper(code))
);

insert into public.currency (code) values
('CAD'),('USD'),('MXN'),('PEN'),('CLP'),('BRL'),('IDR')
on conflict do nothing;

create table public.id_balance_map (
  person_id uuid not null,
  currency varchar(3) not null,
  balance numeric(20,8) not null default 0,

  primary key (person_id, currency),
  foreign key (person_id) references public.person(id),
  foreign key (currency) references public.currency(code)
);


alter table public.id_balance_map
alter column balance type DECIMAL(20,8);

alter table public.payment
alter column amount type DECIMAL(20,8);

alter table public.purchase_detail
alter column price type DECIMAL(20,8);

alter table public.purchase_detail
alter column tax_rate type DECIMAL(20,8);

alter table public.purchase_detail_person
alter column share_rate type DECIMAL(20,8);

alter table public.id_balance_map
alter column balance type DECIMAL(20,8);

alter table public.purchase
alter column total_amount type DECIMAL(20,8);


alter table public.purchase
add column currency varchar(3) not null default 'CAD';

alter table public.purchase
add constraint purchase_currency_fkey
foreign key (currency) references public.currency(code);

alter table public.payment
add column currency varchar(3) not null default 'CAD';

alter table public.payment
add constraint payment_currency_fkey
foreign key (currency) references public.currency(code);



create or replace function public.upsert_purchase_with_details(
  p_id uuid,
  p_name character varying,
  p_date date,
  p_total_amount numeric,
  p_currency varchar(3),
  p_paid_by uuid,
  p_store character varying,
  p_details jsonb
) returns uuid
language plpgsql
as $$
declare
  detail record;
  share record;
  detail_ids uuid[] := array[]::uuid[];
  new_purchase_id uuid;
  new_purchase_detail_id uuid;
  v_currency varchar(3);
begin
  -- normalize/default currency
  v_currency := upper(coalesce(p_currency, 'CAD'));

  -- Upsert the purchase record (now includes currency)
  insert into public.purchase (id, name, date, total_amount, currency, paid_by, store, created_at, updated_at)
  values (
    coalesce(p_id, gen_random_uuid()),
    p_name,
    p_date,
    p_total_amount,
    v_currency,
    p_paid_by,
    p_store,
    timezone('utc-4', now()),
    timezone('utc-4', now())
  )
  on conflict (id) do update set
    name = excluded.name,
    date = excluded.date,
    total_amount = excluded.total_amount,
    currency = excluded.currency,
    paid_by = excluded.paid_by,
    store = excluded.store,
    updated_at = excluded.updated_at
  returning id into new_purchase_id;

  -- Loop through details
  for detail in
    select * from jsonb_to_recordset(p_details)
      as (item_name varchar, quantity int, price numeric(20,8), tax_rate numeric(20,8), detail_id uuid, shares jsonb)
  loop
    insert into public.purchase_detail (id, purchase_id, item_name, quantity, price, tax_rate, created_at, updated_at)
    values (
      coalesce(detail.detail_id, gen_random_uuid()),
      new_purchase_id,
      detail.item_name,
      detail.quantity,
      detail.price,
      detail.tax_rate,
      timezone('utc-4', now()),
      timezone('utc-4', now())
    )
    on conflict (id) do update set
      item_name = excluded.item_name,
      quantity = excluded.quantity,
      price = excluded.price,
      tax_rate = excluded.tax_rate,
      updated_at = excluded.updated_at
    returning id into new_purchase_detail_id;

    detail_ids := array_append(detail_ids, new_purchase_detail_id);

    delete from public.purchase_detail_person
    where purchase_detail_id = new_purchase_detail_id;

    for share in
      select * from jsonb_to_recordset(detail.shares)
        as (person_id uuid, share_rate numeric(20,8))
    loop
      insert into public.purchase_detail_person (purchase_detail_id, person_id, share_rate)
      values (new_purchase_detail_id, share.person_id, share.share_rate);
    end loop;
  end loop;

  delete from public.purchase_detail
  where purchase_id = new_purchase_id
    and id not in (select unnest(detail_ids));

  return new_purchase_id;
end;
$$;

create or replace function public.upsert_purchase_with_details(
  p_id uuid,
  p_name character varying,
  p_date date,
  p_total_amount numeric,
  p_paid_by uuid,
  p_store character varying,
  p_details jsonb
) returns uuid
language sql
as $$
  select public.upsert_purchase_with_details(
    p_id, p_name, p_date, p_total_amount, 'CAD', p_paid_by, p_store, p_details
  );
$$;


INSERT INTO public.id_balance_map (person_id, currency, balance) VALUES
('58060f7f-c268-4d82-9d70-dc5054d37274', 'Andrew','157.22309565'),
('be4ef15c-ae2e-48f0-86d7-4f2c6618d94f', 'Janis','-602.64968446'),
('e5a1406a-af26-4bc2-81b6-48d99ef6073a', 'Jefferson','-2562.42690875'),
('d04fd5ad-ea4c-4fac-846a-037d7da855f6', 'Louis','1158.26783537'),
('3093164f-d3da-48cb-abb2-05857ecfba18', 'Maverick','-1306.92692278'),
('6ccb3f15-f204-4145-8206-dc37ed5afeb4', 'Razan','3156.51116409');

create or replace function public.add_balances_by_delta(deltas jsonb)
returns void
language sql
as $$
  insert into public.id_balance_map (person_id, currency, balance)
  select
    person_id,
    upper(currency)::varchar(3) as currency,
    balance::numeric(20,8) as balance
  from jsonb_to_recordset(deltas) as t(
    person_id uuid,
    currency text,
    balance numeric
  )
  where abs(balance::numeric) >= 0.00000001
  on conflict (person_id, currency)
  do update set
    balance = public.id_balance_map.balance + excluded.balance;
$$;


create or replace function public.hard_refresh_balances()
returns void
language plpgsql
as $$
begin
  /*
    1) Recompute purchase.total_amount from purchase_detail rows
       (purchase has exactly one currency, so no grouping needed here).
  */
  with purchase_totals as (
    select
      pd.purchase_id,
      coalesce(
        sum(
          (pd.quantity::numeric(20,8) * pd.price::numeric(20,8))
          * (1 + (pd.tax_rate::numeric(20,8) / 100))
        ),
        0::numeric(20,8)
      ) as total_amount
    from public.purchase_detail pd
    group by pd.purchase_id
  )
  update public.purchase p
  set
    total_amount = coalesce(pt.total_amount, 0::numeric(20,8)),
    updated_at   = timezone('utc-4', now())
  from purchase_totals pt
  where p.id = pt.purchase_id;

  -- Purchases with no details -> total_amount = 0
  update public.purchase p
  set
    total_amount = 0::numeric(20,8),
    updated_at   = timezone('utc-4', now())
  where not exists (
    select 1 from public.purchase_detail pd where pd.purchase_id = p.id
  );

  /*
    2) Rebuild id_balance_map per (person_id, currency)
       We TRUNCATE the real balance table and re-insert the canonical balances.
  */
  truncate table public.id_balance_map;

  insert into public.id_balance_map (person_id, currency, balance)
  select
    t.person_id,
    t.currency,
    sum(t.delta)::numeric(20,8) as balance
  from (
    -- (A) Shares: each person OWES their share -> negative contribution
    select
      s.person_id as person_id,
      upper(p.currency) as currency,
      -(
        (pd.quantity::numeric(20,8) * pd.price::numeric(20,8))
        * (1 + (pd.tax_rate::numeric(20,8) / 100))
        * (s.share_rate::numeric(20,8))
      ) as delta
    from public.purchase_detail pd
    join public.purchase p
      on p.id = pd.purchase_id
    join public.purchase_detail_person s
      on s.purchase_detail_id = pd.id

    union all

    -- (B) Paid-by: the payer is credited the full purchase.total_amount
    select
      p.paid_by as person_id,
      upper(p.currency) as currency,
      p.total_amount::numeric(20,8) as delta
    from public.purchase p
    where p.paid_by is not null

    union all

    -- (C) Payments: from_person pays -> their balance increases (less negative)
    select
      pay.from_person_id as person_id,
      upper(pay.currency) as currency,
      pay.amount::numeric(20,8) as delta
    from public.payment pay
    where pay.from_person_id is not null

    union all

    -- (D) Payments: to_person receives -> their balance decreases
    select
      pay.to_person_id as person_id,
      upper(pay.currency) as currency,
      -pay.amount::numeric(20,8) as delta
    from public.payment pay
    where pay.to_person_id is not null
  ) t
  where t.person_id is not null
  group by t.person_id, t.currency;

end;
$$;
