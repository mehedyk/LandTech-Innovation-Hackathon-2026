"""Seeded DUMMY Bangladesh land registry (all names/IDs fictional). Deterministic: SEED=20261017."""
import random, json, csv, os
from datetime import date, timedelta
SEED=20261017; R=random.Random(SEED)
OUT=os.environ.get("OUT","/mnt/user-data/outputs/seed_registry")
os.makedirs(OUT,exist_ok=True)
FIRST=["Abdul","Rahim","Karim","Jamal","Nasir","Salam","Hasan","Mizan","Rafiq","Kabir","Anwar","Shafiq","Billal","Faruk","Sumon","Habib"]
LAST=["Mia","Sheikh","Howlader","Talukder","Chowdhury","Sarker","Bhuiyan","Akand","Hossain","Miah","Biswas","Khan"]
FEM=["Rokeya","Amena","Jahanara","Salma","Nasima","Rabeya","Shirin","Morzina"]
def name(f=False): return f"{R.choice(FEM if f else FIRST)} {R.choice(LAST)}"
MOUZA=[("M001","Dakshin Char Rampur","Sadar","Faridpur"),("M002","Uttar Baliadi","Mollahat","Bagerhat"),("M003","Shaheb Bari","Sreepur","Gazipur")]
SRO={"M001":"Faridpur Sadar SRO","M002":"Mollahat SRO","M003":"Sreepur SRO"}
def d(y,a=0,b=364): return date(y,1,1)+timedelta(days=R.randint(a,b))
plots=[];khatians=[];deeds=[];muts=[];labels=[];parties={}
did=[0];mid=[0];kid=[0]
def person(n):
    parties.setdefault(n,f"P{len(parties)+1:04d}"); return parties[n]
def khat(survey,mouza,no,plot_no,owners,area,landclass,year,**kw):
    kid[0]+=1
    khatians.append(dict(khatian_uid=f"K{kid[0]:04d}",survey=survey,mouza_id=mouza,khatian_no=no,plot_no=plot_no,
      owners=[dict(name=n,party_id=person(n),share=s) for n,s in owners],area_dec=round(area,2),land_class=landclass,survey_year=year,**kw))
    return f"K{kid[0]:04d}"
def deed(mouza,seller,buyer,plot_ref,area,dt,share_sold="full",kind="sale",qr_ok=True,sig_ok=True,seller_share_claimed=None):
    did[0]+=1; no=f"{R.randint(1000,9999)}/{dt.year}"
    deeds.append(dict(deed_uid=f"D{did[0]:04d}",deed_no=no,type=kind,registration_date=dt.isoformat(),sub_registry=SRO[mouza],mouza_id=mouza,
      seller=seller,seller_party_id=person(seller),buyer=buyer,buyer_party_id=person(buyer),schedule_survey=plot_ref[0],schedule_plot_no=plot_ref[1],
      area_sold_dec=round(area,2),share_sold=share_sold,qr_valid=qr_ok,signature_consistent=sig_ok))
    return f"D{did[0]:04d}"
def mut(deed_uid,status,applied=None,decided=None,note="",area=None,new_khatian=None):
    mid[0]+=1
    muts.append(dict(mutation_case=f"MC{mid[0]:04d}",deed_uid=deed_uid,status=status,applied_on=applied.isoformat() if applied else None,
      decided_on=decided.isoformat() if decided else None,area_mutated_dec=area,new_khatian=new_khatian,note=note))
BASE=date(2026,10,17)
for i in range(1,25):
    L=f"L{i:02d}"; m=MOUZA[i%3][0]; area=round(R.uniform(20,300),2); base=R.randint(100,900)
    a,b,c=name(),name(),name(); h=[(name(),"1/2"),(name(True),"1/2")] if R.random()<.5 else [(name(),"1")]
    cs=khat("CS",m,str(R.randint(1,300)),str(base),[(a,"1")],area,"cultivated",R.choice([1910,1925,1936]),lineage=L)
    sa=khat("SA",m,str(R.randint(1,900)),str(base+R.randint(5,60)),[(a,"1")],area,"cultivated",1960,lineage=L)
    rs=khat("RS",m,str(R.randint(1,1500)),str(base+R.randint(60,200)),[(b,"1")],area,"cultivated",R.choice([1990,2000,2010]),lineage=L)
    bs=khat("BS",m,str(R.randint(1,3000)),str(base+R.randint(200,400)),h,area,R.choice(["cultivated","homestead","pond"]),R.choice([2005,2012,2018]),lineage=L)
    plots.append(dict(lineage=L,mouza_id=m,area_dec=area,cs=cs,sa=sa,rs=rs,bs=bs))
    cur=khatians[-1]; bsplot=("BS",cur["plot_no"]); seller=cur["owners"][0]["name"]
    if i in (5,9,12,14,20,22,3,7,17): pass
    else:
        sold=round(area*R.choice([.25,.5,1]),2); buyer=name(); dt=d(R.randint(2015,2025))
        dd=deed(m,seller,buyer,bsplot,sold,dt,"full" if len(cur["owners"])==1 else "1/2" if False else "full")
        if len(cur["owners"])>1:  # co-owner sells only own half -> fix
            deeds[-1]["share_sold"]="1/2"; deeds[-1]["area_sold_dec"]=round(area/2,2); sold=round(area/2,2)
        ap=dt+timedelta(days=R.randint(3,40)); mut(dd,"approved",ap,ap+timedelta(days=R.randint(10,28)),"normal",sold,f"K-NEW-{dd}")
    if i==5:  # duplicate sale
        dt=d(2023,0,200); b1,b2=name(),name()
        d1=deed(m,seller,b1,bsplot,area*.5,dt); d2=deed(m,seller,b2,bsplot,area*.5,dt+timedelta(days=41))
        mut(d1,"approved",dt+timedelta(days=9),dt+timedelta(days=30),"normal",area*.5,"K-NEW-"+d1); mut(d2,"pending",dt+timedelta(days=60),None,"awaiting hearing")
        labels.append((L,"P3","duplicate_sale",[d1,d2]))
    if i==9:  # overlapping transfers exceed plot area
        dt=d(2022,0,200); d1=deed(m,seller,name(),bsplot,area*.7,dt); d2=deed(m,seller,name(),bsplot,area*.6,dt+timedelta(days=200))
        mut(d1,"approved",dt+timedelta(days=5),dt+timedelta(days=25),"normal",area*.7,"K-NEW-"+d1)
        labels.append((L,"P3","overlapping_transfer_area_exceeds_plot",[d1,d2]))
    if i==12:  # share overrun: co-owner holds 1/2 but deed claims full plot
        cur["owners"]=[dict(name=name(),party_id="",share="1/2"),dict(name=seller,party_id=person(seller),share="1/2")]
        for o in cur["owners"]: o["party_id"]=person(o["name"])
        dt=d(2024,0,200); d1=deed(m,cur["owners"][0]["name"],name(),bsplot,area,dt,"full")
        mut(d1,"rejected",dt+timedelta(days=7),dt+timedelta(days=35),"share exceeds record"); 
        labels.append((L,"P3","ownership_share_conflict",[d1]))
    if i==14:  # registered but never mutated
        dt=d(2023,0,200); d1=deed(m,seller,name(),bsplot,area,dt); labels.append((L,"P4","registered_not_mutated",[d1]))
    if i==3:  # mutation area mismatch
        dt=d(2021,0,200); d1=deed(m,seller,name(),bsplot,area*.5,dt); mut(d1,"approved",dt+timedelta(days=4),dt+timedelta(days=20),"approved",round(area*.8,2),"K-NEW-"+d1)
        labels.append((L,"P3","deed_vs_mutation_area_mismatch",[d1]))
    if i==7:  # rejected, resubmitted, pending (exception workflow)
        dt=d(2025,0,150); d1=deed(m,seller,name(),bsplot,area,dt)
        mut(d1,"rejected",dt+timedelta(days=5),dt+timedelta(days=33),"missing dag schedule / DCR"); mut(d1,"pending",dt+timedelta(days=50),None,"resubmitted")
        labels.append((L,"P4","rejected_then_resubmitted",[d1]))
    if i==17:  # chain break: RS owner unrelated to SA owner, no linking deed
        rsk=[k for k in khatians if k["khatian_uid"]==rs][0]; rsk["owners"]=[dict(name=name(),party_id="",share="1")]; rsk["owners"][0]["party_id"]=person(rsk["owners"][0]["name"])
        labels.append((L,"P3","chain_break_SA_to_RS_no_link_deed",[sa,rs]))
    if i==20:  # BS records khas though RS private
        cur["owners"]=[dict(name="Government of Bangladesh (Khas)",party_id=person("Government of Bangladesh (Khas)"),share="1")]; cur["land_class"]="khas"
        dt=d(2024,0,200); d1=deed(m,[k for k in khatians if k["khatian_uid"]==rs][0]["owners"][0]["name"],name(),("RS",[k for k in khatians if k["khatian_uid"]==rs][0]["plot_no"]),area,dt)
        labels.append((L,"P5","khas_claim_conflicts_with_deed",[d1,bs]))
    if i==22:  # forged / invalid QR + signature mismatch
        dt=d(2025,0,200); d1=deed(m,seller,name(),bsplot,area*.5,dt,qr_ok=False,sig_ok=False)
        mut(d1,"pending",dt+timedelta(days=12),None,"verification requested")
        labels.append((L,"P2","invalid_qr_and_signature_mismatch",[d1]))
def w(name_,rows):
    if not rows: return
    flat=[{k:(json.dumps(v) if isinstance(v,(list,dict)) else v) for k,v in r.items()} for r in rows]
    keys=[]; [keys.append(k) for r in flat for k in r if k not in keys]
    with open(f"{OUT}/{name_}.csv","w",newline="",encoding="utf-8") as f:
        wr=csv.DictWriter(f,fieldnames=keys); wr.writeheader(); wr.writerows(flat)
lab=[dict(lineage=a,problem_area=b,anomaly=c,records=r) for a,b,c,r in labels]
parties_rows=[dict(party_id=v,name=k) for k,v in parties.items()]
mouza_rows=[dict(mouza_id=a,name=b,upazila=c,district=dd) for a,b,c,dd in MOUZA]
db=dict(_meta=dict(note="FICTIONAL SYNTHETIC DATA - not real persons or parcels",seed=SEED,generated_for="land-software P1-P5 testing"),
 mouzas=mouza_rows,parties=parties_rows,parcel_lineages=plots,khatians=khatians,deeds=deeds,mutations=muts,anomaly_labels=lab)
json.dump(db,open(f"{OUT}/seed_registry.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
for n,r in [("mouzas",mouza_rows),("parties",parties_rows),("parcel_lineages",plots),("khatians",khatians),("deeds",deeds),("mutations",muts),("anomaly_labels",lab)]: w(n,r)
print({k:len(v) for k,v in db.items() if isinstance(v,list)})
