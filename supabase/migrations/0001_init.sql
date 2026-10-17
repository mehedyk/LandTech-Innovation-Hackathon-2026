-- Ardh · LandTech 2026 · Migration 0001 (P3: Fraud & Double-Selling)
-- SAFE TO RE-RUN: only CREATE ... IF NOT EXISTS / CREATE OR REPLACE.
-- Contains no DROP and no CASCADE. DUMMY DATA ONLY (see seed.sql).

create extension if not exists pgcrypto;

-- ───────── Types ─────────
do $$ begin
  create type khatian_kind as enum ('CS','SA','RS','BS');
exception when duplicate_object then null; end $$;

do $$ begin
  create type deed_status as enum ('registered','flagged','blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type mutation_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type flag_kind as enum ('double_sale','seller_not_owner','area_exceeds_parcel','mutation_mismatch');
exception when duplicate_object then null; end $$;

-- ───────── Core tables ─────────
-- Parties are FICTIONAL. No NID, phone or real names are stored, by design.
create table if not exists parties (
  id         uuid primary key default gen_random_uuid(),
  name_en    text not null,
  name_bn    text,
  dummy_ref  text not null unique default ('DUMMY-' || substr(md5(random()::text), 1, 8)),
  created_at timestamptz not null default now()
);

create table if not exists parcels (
  id           uuid primary key default gen_random_uuid(),
  district     text not null,
  upazila      text not null,
  mouza        text not null,
  dag_no       text not null,
  area_decimal numeric(12,4) not null check (area_decimal > 0),
  created_at   timestamptz not null default now(),
  unique (district, upazila, mouza, dag_no)
);

-- Historical record entries (CS/SA/RS/BS). Evidence trail, not the live state.
create table if not exists khatians (
  id          uuid primary key default gen_random_uuid(),
  parcel_id   uuid not null references parcels(id),
  kind        khatian_kind not null,
  khatian_no  text not null,
  owner_id    uuid not null references parties(id),
  share       numeric(7,6) not null check (share > 0 and share <= 1),
  recorded_on date,
  unique (parcel_id, kind, khatian_no, owner_id)
);

-- Live ownership state per parcel. Changes ONLY via approve_mutation().
create table if not exists holdings (
  id        uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references parcels(id),
  party_id  uuid not null references parties(id),
  share     numeric(7,6) not null check (share > 0 and share <= 1),
  unique (parcel_id, party_id)
);

create table if not exists deeds (
  id            uuid primary key default gen_random_uuid(),
  deed_no       text not null unique,
  parcel_id     uuid not null references parcels(id),
  seller_id     uuid not null references parties(id),
  buyer_id      uuid not null references parties(id),
  share_sold    numeric(7,6) not null check (share_sold > 0 and share_sold <= 1),
  area_decimal  numeric(12,4) not null check (area_decimal > 0),
  registered_on date not null default current_date,
  status        deed_status not null default 'registered',
  fingerprint   text,
  created_at    timestamptz not null default now(),
  check (seller_id <> buyer_id)
);

create table if not exists mutations (
  id            uuid primary key default gen_random_uuid(),
  deed_id       uuid not null unique references deeds(id),
  status        mutation_status not null default 'pending',
  applied_on    date not null default current_date,
  decided_on    date
);

create table if not exists risk_flags (
  id         uuid primary key default gen_random_uuid(),
  deed_id    uuid not null references deeds(id),
  kind       flag_kind not null,
  weight     int not null check (weight between 1 and 100),
  reason     text not null,
  created_at timestamptz not null default now()
);

-- Tamper-evident, hash-chained audit log (append-only).
create table if not exists audit_log (
  id         bigint generated always as identity primary key,
  entity     text not null,
  entity_id  uuid not null,
  action     text not null,
  payload    jsonb not null default '{}'::jsonb,
  prev_hash  text not null,
  hash       text not null,
  created_at timestamptz not null default clock_timestamp()
);

create index if not exists idx_deeds_parcel_seller on deeds (parcel_id, seller_id);
create index if not exists idx_flags_deed on risk_flags (deed_id);

-- ───────── Fingerprint (P2-style verification) ─────────
create or replace function deed_fingerprint(d deeds) returns text
language sql immutable as $$
  select encode(digest(
    concat_ws('|', d.deed_no, d.parcel_id, d.seller_id, d.buyer_id,
              d.share_sold::text, d.area_decimal::text, d.registered_on::text),
    'sha256'), 'hex');
$$;

create or replace function trg_deed_before_insert() returns trigger
language plpgsql as $$
begin
  perform 1 from parcels where id = new.parcel_id for update;  -- serialise sales per parcel
  new.fingerprint := deed_fingerprint(new);
  return new;
end $$;

-- ───────── Audit chain ─────────
create or replace function trg_audit_chain() returns trigger
language plpgsql as $$
declare last_hash text;
begin
  perform pg_advisory_xact_lock(7001);
  select hash into last_hash from audit_log order by id desc limit 1;
  new.prev_hash := coalesce(last_hash, repeat('0', 64));
  new.hash := encode(digest(
    new.prev_hash || new.entity || new.entity_id::text || new.action
    || new.payload::text || new.created_at::text, 'sha256'), 'hex');
  return new;
end $$;

create or replace function trg_audit_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_log is append-only';
end $$;

create or replace function write_audit(p_entity text, p_id uuid, p_action text, p_payload jsonb)
returns void language plpgsql as $$
begin
  insert into audit_log(entity, entity_id, action, payload, prev_hash, hash)
  values (p_entity, p_id, p_action, p_payload, '', '');
end $$;

create or replace function verify_audit_chain()
returns table (ok boolean, broken_at bigint)
language plpgsql stable as $$
declare r record; prev text := repeat('0', 64); h text;
begin
  for r in select * from audit_log order by id loop
    h := encode(digest(prev || r.entity || r.entity_id::text || r.action
         || r.payload::text || r.created_at::text, 'sha256'), 'hex');
    if r.prev_hash <> prev or r.hash <> h then
      return query select false, r.id; return;
    end if;
    prev := r.hash;
  end loop;
  return query select true, null::bigint;
end $$;

-- ───────── Fraud checks (run after each deed insert) ─────────
create or replace function trg_deed_after_insert() returns trigger
language plpgsql as $$
declare
  held numeric := 0;
  already_sold numeric := 0;
  p_area numeric;
  new_status deed_status := 'registered';
begin
  select share into held from holdings
   where parcel_id = new.parcel_id and party_id = new.seller_id;
  held := coalesce(held, 0);

  select coalesce(sum(d.share_sold), 0) into already_sold
    from deeds d
   where d.parcel_id = new.parcel_id and d.seller_id = new.seller_id
     and d.id <> new.id and d.status <> 'blocked'
     and not exists (select 1 from mutations m where m.deed_id = d.id and m.status = 'approved');

  select area_decimal into p_area from parcels where id = new.parcel_id;

  if held = 0 then
    insert into risk_flags(deed_id, kind, weight, reason)
    values (new.id, 'seller_not_owner', 70, 'Seller has no recorded holding on this parcel.');
    new_status := 'blocked';
  elsif new.share_sold > held - already_sold then
    insert into risk_flags(deed_id, kind, weight, reason)
    values (new.id, 'double_sale', 60,
      format('Sold share %s exceeds available %s (held %s, already sold in pending deeds %s).',
             new.share_sold, held - already_sold, held, already_sold));
    new_status := 'blocked';
  end if;

  if new.area_decimal > p_area then
    insert into risk_flags(deed_id, kind, weight, reason)
    values (new.id, 'area_exceeds_parcel', 30,
      format('Deed area %s exceeds parcel area %s decimals.', new.area_decimal, p_area));
    if new_status = 'registered' then new_status := 'flagged'; end if;
  end if;

  if new_status <> 'registered' then
    update deeds set status = new_status where id = new.id;
  end if;

  perform write_audit('deed', new.id, 'registered',
    jsonb_build_object('deed_no', new.deed_no, 'status', new_status, 'fingerprint', new.fingerprint));
  return new;
end $$;

-- ───────── Mutation approval (the only way holdings change) ─────────
create or replace function approve_mutation(p_mutation_id uuid) returns void
language plpgsql as $$
declare m mutations; d deeds; s_held numeric;
begin
  select * into m from mutations where id = p_mutation_id for update;
  if not found then raise exception 'mutation not found'; end if;
  if m.status <> 'pending' then raise exception 'mutation already decided'; end if;

  select * into d from deeds where id = m.deed_id for update;
  if d.status = 'blocked' then
    insert into risk_flags(deed_id, kind, weight, reason)
    values (d.id, 'mutation_mismatch', 50, 'Mutation attempted on a blocked deed.');
    raise exception 'deed % is blocked; mutation refused', d.deed_no;
  end if;

  select share into s_held from holdings where parcel_id = d.parcel_id and party_id = d.seller_id;
  if coalesce(s_held, 0) < d.share_sold then
    raise exception 'seller holding changed; mutation refused';
  end if;

  if s_held - d.share_sold = 0 then
    delete from holdings where parcel_id = d.parcel_id and party_id = d.seller_id;
  else
    update holdings set share = s_held - d.share_sold
     where parcel_id = d.parcel_id and party_id = d.seller_id;
  end if;

  insert into holdings(parcel_id, party_id, share) values (d.parcel_id, d.buyer_id, d.share_sold)
  on conflict (parcel_id, party_id) do update set share = holdings.share + excluded.share;

  update mutations set status = 'approved', decided_on = current_date where id = m.id;
  perform write_audit('mutation', m.id, 'approved', jsonb_build_object('deed_id', d.id));
end $$;

-- ───────── Risk view + public verification ─────────
create or replace view v_deed_risk as
select d.id as deed_id, d.deed_no, d.status,
       coalesce(sum(f.weight), 0)::int as risk_score,
       case when coalesce(sum(f.weight),0) >= 60 then 'high'
            when coalesce(sum(f.weight),0) >= 25 then 'medium'
            else 'low' end as risk_level
  from deeds d left join risk_flags f on f.deed_id = d.id
 group by d.id, d.deed_no, d.status;

-- Citizen/QR check: recomputes the fingerprint and compares. Exposes no personal data.
create or replace function verify_deed(p_deed_no text, p_fingerprint text)
returns table (found boolean, fingerprint_match boolean, status deed_status, risk_level text)
language sql security definer set search_path = public as $$
  select true,
         d.fingerprint = p_fingerprint and deed_fingerprint(d) = p_fingerprint,
         d.status, r.risk_level
    from deeds d join v_deed_risk r on r.deed_id = d.id
   where d.deed_no = p_deed_no
  union all
  select false, false, null::deed_status, null::text
   where not exists (select 1 from deeds where deed_no = p_deed_no);
$$;

-- ───────── Triggers ─────────
create or replace trigger deed_before_insert before insert on deeds
  for each row execute function trg_deed_before_insert();
create or replace trigger deed_after_insert after insert on deeds
  for each row execute function trg_deed_after_insert();
create or replace trigger audit_chain before insert on audit_log
  for each row execute function trg_audit_chain();
create or replace trigger audit_no_update before update or delete on audit_log
  for each row execute function trg_audit_immutable();

-- ───────── Row Level Security (v1: any signed-in officer; roles come in v2) ─────────
alter table parties    enable row level security;
alter table parcels    enable row level security;
alter table khatians   enable row level security;
alter table holdings   enable row level security;
alter table deeds      enable row level security;
alter table mutations  enable row level security;
alter table risk_flags enable row level security;
alter table audit_log  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['parties','parcels','khatians','holdings','deeds','mutations','risk_flags','audit_log']
  loop
    begin
      execute format('create policy %I on %I for select to authenticated using (true)', t || '_read', t);
    exception when duplicate_object then null; end;
  end loop;
  foreach t in array array['parties','parcels','khatians','deeds','mutations']
  loop
    begin
      execute format('create policy %I on %I for insert to authenticated with check (true)', t || '_write', t);
    exception when duplicate_object then null; end;
  end loop;
end $$;

grant execute on function verify_deed(text, text) to anon, authenticated;
