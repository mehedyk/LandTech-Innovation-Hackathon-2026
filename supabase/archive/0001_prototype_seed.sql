-- Ardh · DUMMY seed data. Every name and number below is fictional.
-- Re-runnable: fixed IDs + ON CONFLICT DO NOTHING (deeds are guarded by deed_no).

insert into parties (id, name_en, name_bn, dummy_ref) values
  ('00000000-0000-0000-0000-000000000001','Rahim Dummy','ডামি রহিম','DUMMY-0001'),
  ('00000000-0000-0000-0000-000000000002','Karim Dummy','ডামি করিম','DUMMY-0002'),
  ('00000000-0000-0000-0000-000000000003','Salma Dummy','ডামি সালমা','DUMMY-0003'),
  ('00000000-0000-0000-0000-000000000004','Tania Dummy','ডামি তানিয়া','DUMMY-0004'),
  ('00000000-0000-0000-0000-000000000005','Imran Dummy','ডামি ইমরান','DUMMY-0005')
on conflict do nothing;

insert into parcels (id, district, upazila, mouza, dag_no, area_decimal) values
  ('10000000-0000-0000-0000-000000000001','Demo-District','Demo-Upazila','Demo-Mouza-A','101',20.0000),
  ('10000000-0000-0000-0000-000000000002','Demo-District','Demo-Upazila','Demo-Mouza-A','102',12.5000)
on conflict do nothing;

-- Record trail (CS -> RS) and the live holdings state
insert into khatians (parcel_id, kind, khatian_no, owner_id, share, recorded_on) values
  ('10000000-0000-0000-0000-000000000001','CS','11','00000000-0000-0000-0000-000000000001',1,'1920-01-01'),
  ('10000000-0000-0000-0000-000000000001','RS','57','00000000-0000-0000-0000-000000000001',1,'1965-01-01'),
  ('10000000-0000-0000-0000-000000000002','RS','58','00000000-0000-0000-0000-000000000002',1,'1965-01-01')
on conflict do nothing;

insert into holdings (parcel_id, party_id, share) values
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',1),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002',1)
on conflict do nothing;

-- Scenario 1: legitimate sale (Rahim -> Karim, 60%)
insert into deeds (deed_no, parcel_id, seller_id, buyer_id, share_sold, area_decimal, registered_on)
select 'DEMO-D-001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',0.6,12.0,'2026-09-01'
where not exists (select 1 from deeds where deed_no = 'DEMO-D-001');

-- Scenario 2: DOUBLE SALE (same 60% sold again to Salma while the first is unmutated) -> blocked
insert into deeds (deed_no, parcel_id, seller_id, buyer_id, share_sold, area_decimal, registered_on)
select 'DEMO-D-002','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003',0.6,12.0,'2026-09-03'
where not exists (select 1 from deeds where deed_no = 'DEMO-D-002');

-- Scenario 3: FAKE SELLER (Tania never owned parcel 102) -> blocked
insert into deeds (deed_no, parcel_id, seller_id, buyer_id, share_sold, area_decimal, registered_on)
select 'DEMO-D-003','10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000005',0.5,6.0,'2026-09-05'
where not exists (select 1 from deeds where deed_no = 'DEMO-D-003');

-- Scenario 4: area claim larger than the parcel -> flagged
insert into deeds (deed_no, parcel_id, seller_id, buyer_id, share_sold, area_decimal, registered_on)
select 'DEMO-D-004','10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000005',0.4,30.0,'2026-09-06'
where not exists (select 1 from deeds where deed_no = 'DEMO-D-004');
