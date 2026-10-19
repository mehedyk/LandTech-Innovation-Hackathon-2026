"""Build the concept note (3 pages, Bangla and English) from one source of truth.

Outputs in docs/concept-note/: Ardh-concept-note.<lang>.pdf, .html (print layout) and CONCEPT_NOTE.<lang>.md.
Inline markers like [2] point to docs/references.json (same numbers in every file).
Optional tool. Needs: pip install playwright && playwright install chromium (and a Bengali font for Bangla).
Usage: python3 scripts/build-concept-note.py && python3 scripts/apply-refs.py
"""
import base64, json, os, re
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'docs', 'concept-note')
REFS = json.load(open(os.path.join(ROOT, 'docs', 'references.json'), encoding='utf-8'))
MARK = re.compile(r'\[(\d{1,2})\]')
LIVE = 'https://land-tech-innovation-hackathon-2026.vercel.app/'

# ───────────────────────── content ─────────────────────────
EN = dict(
  lang='en', file='Ardh-concept-note.en',
  title='Ardh Guard: explainable conflict checks for land deeds, before registration and before mutation',
  sub='Team Ardh · LandTech Innovation Hackathon 2026 · Track: Digital Land Records, Verification & Digitization · Problem P3: Catch Fraud & Double-Selling [1]',
  links='Live prototype [19] · Pitch deck [20] · Code: public GitHub repository, linked on the submission form',
  img='check-en.png', figcap='Figure 2. The officer view: a second sale of the same land is held, with the reason. The same screen exists in Bangla.',
  h=['1. The problem and why it matters','2. Our solution: Ardh Guard','3. How it works','4. Main features','5. Using it across the country','6. What we will do next','7. Team and tools','References'],
  p1=['A land transaction in Bangladesh passes through offices that do not share one live view of the record. Records, registration and management of land run through three detached authorities under two ministries, which creates possibilities of miscoordination and information errors [4]. The khatian is the core record, yet it carries known kinds of errors: clerical mistakes, mistakes by officers, and errors from inheritance and sub-division [2]. Reform work therefore asks for inter-checking between registering officers and Assistant Commissioners (Land) before registration, and for alerts to owners when a transfer is attempted [3].'],
  stat=('70%+','of civil disputes arise from land-related conflicts, according to Ministry of Law figures reported in the press [10]'),
  slips=('What slips through today','The same share sold twice · a seller who sells more than they own · a deed for land the record shows as khas · a mutation that changes a different area than the deed.'),
  p1b=['Digital services have eased access: e-mutation cut citizens’ time, cost and visits, but coordination problems and inaccurate survey records remain [5], and rural users still face low digital literacy, poor connectivity and dependence on intermediaries [7]. Blockchain land-title proposals for Bangladesh store and secure titles [6]; they do not screen a deed for conflicts before it is accepted. In our own scoping searches [11] that pre-transaction, explainable step looked thin (a scoping impression, not a systematic review).',
         '<b>Who uses it:</b> the Sub-Registrar (primary), AC Land officers (mutation), and citizens and buyers. Banks and courts later.'],
  p2=['<b>Ardh Guard</b> is an explainable conflict-detection layer with two checkpoints: <b>before registration</b> and <b>before mutation</b>. It compares a deed with the record chain (CS, SA, RS and BS khatians), the seller’s earlier deeds and the mutation history, and flags the case for a human officer <b>with plain-language reasons</b>. It never decides ownership. Every check is a readable rule, so an officer can explain a refusal to a citizen.'],
  chips=[('h','Land sold more than once'),('h','Selling more than the seller owns'),('h','Government (khas) land'),('h','Seller not on the record'),('h','Document looks altered (QR, signature)'),('r','Mutation does not match the deed'),('r','Deed never mutated'),('n','Mutation resubmitted after rejection')],
  legend='Hold · Review · Note',
  flow=[('Request arrives','a deed or a mutation'),('Ardh Guard compares','record chain, earlier deeds'),('Alert with reasons','plain language, records to open'),('Officer decides','hold, dismiss, escalate')],
  figflow='Figure 1. How a check flows.',
  p3=['<b>Engine:</b> pure TypeScript functions. Input: the registry (deeds, khatian chain, mutations). Output: alerts with structured reasons, which the interface phrases in Bangla or English.',
      '<b>Interface:</b> React [13], Vite [14] and Tailwind CSS [15], hosted on Vercel [16]. Bangla by default with an English toggle; views for citizen / buyer, officer / admin, or both.',
      '<b>Data:</b> a fictional registry (3 mouzas, 24 parcels, 96 khatians, 25 deeds, 23 mutation cases, 9 planted anomalies). No real people, NID numbers, phone numbers or land records, and nothing scraped, as the rule book requires [1].',
      '<b>Evaluation:</b> the rules caught 8 of 8 testable planted anomalies and raised no alerts outside them. This is a <b>regression test, not accuracy</b>: the data is small and the rules were written knowing it.'],
  features=['Check a deed before registration: a full audit view with the verdict, the checks that passed or failed, the record chain and a downloadable report (HTML, JSON, PDF).','Alert inbox for officers: confirm hold, dismiss or escalate.','Parcel pages: the CS, SA, RS, BS chain, deeds and mutations together.','Citizen “check before you buy” page that shows nothing about other people’s deeds.','Bangla (default) and English; citizen, officer and both views.','Light and dark themes; CSV export of alerts and benchmark; in-app benchmark, how-it-works, roadmap and limits pages.'],
  path=[('Pilot','One sub-registry office and its AC Land office, under a formal data-sharing agreement, read-only and in shadow mode first, with every source agreed by its owner.'),('Scale','Upazila by upazila, then district. The engine runs in the browser and needs little infrastructure.'),('Prerequisite','Clean, linked parcel history. Resolving plots across surveys is the hardest open question, and we say so.'),('Governance','Officers keep every decision. Sign-in, roles and an audit trail come before any real use.')],
  next=[('v1.1 · final round',['Coherent-chain test data and a chain-break rule','Owner alerts, dispute hold, saved decisions with an audit trail (Supabase [17]), sign-in and roles','Bangla name matching; a “missing or stale data” outcome; a “messy but innocent” benchmark for false alarms','AI: Bangla and English case summaries from a pretrained language model, reviewed by the officer']),
        ('v2 · after the hackathon',['Plot resolution across surveys; a pilot','AI: Bangla OCR (pretrained) to read scanned khatians and deeds, with officer confirmation','AI: machine-learning risk ranking after the rules, once realistic data exists, keeping the rules and reasons','Mortgage, court-case, vested-property and land-tax checks, each needing a source from its owner','Cadastral map; identity checks only with a legal basis and consent, never biometrics'])],
  aiNote='AI items are plans; pretrained models would come from platforms such as Hugging Face [18]. No AI model runs in the prototype today.',
  limits='<b>Limitations:</b> dummy data only; small benchmark; chain-break detection untested; exact name matching; the role switch is a demo control, not access control; mortgage, court, vested-property and tax checks are not built.',
  team='<b>Jobayer</b> (Team Leader, @MJZ-Hossen) · <b>S.M. Mehedy Kawser</b> (@mehedyk) · Faculty mentor: Zannatul Mawa Koli · Industry mentor: MD. Tahamid Hassan Sadib (CSE-TECH). <b>AI tools used:</b> Claude [12] for planning and drafting code and documents; Consensus [11] for scoping searches.',
)

BN = dict(
  lang='bn', file='Ardh-concept-note.bn',
  title='Ardh Guard: নিবন্ধন ও নামজারির আগে দলিলের অসংগতি ধরার ব্যাখ্যাযোগ্য ব্যবস্থা',
  sub='টিম Ardh · ল্যান্ডটেক ইনোভেশন হ্যাকাথন ২০২৬ · ট্র্যাক: ডিজিটাল ভূমি রেকর্ড, যাচাইকরণ ও ডিজিটাইজেশন · সমস্যা P3: জালিয়াতি ও একই জমি একাধিকবার বিক্রি শনাক্তকরণ [1]',
  links='লাইভ প্রোটোটাইপ [19] · পিচ ডেক [20] · কোড: পাবলিক গিটহাব রিপোজিটরি, জমাদানের ফর্মে লিংক দেওয়া',
  img='check.png', figcap='চিত্র ২. কর্মকর্তার দেখা: একই জমির দ্বিতীয় বিক্রি কারণসহ আটকে রাখা হয়েছে। একই পাতা ইংরেজিতেও আছে।',
  h=['১. সমস্যা এবং কেন এটি গুরুত্বপূর্ণ','২. আমাদের সমাধান: Ardh Guard','৩. কীভাবে কাজ করে','৪. মূল বৈশিষ্ট্য','৫. সারা দেশে ব্যবহারের পথ','৬. আমরা এরপর যা করব','৭. দল ও ব্যবহৃত টুল','তথ্যসূত্র'],
  p1=['বাংলাদেশে জমির লেনদেন এমন কয়েকটি অফিসের ভেতর দিয়ে যায়, যাদের হাতে রেকর্ডের একটি অভিন্ন, হালনাগাদ চিত্র থাকে না। জমির রেকর্ড, নিবন্ধন ও ব্যবস্থাপনা চলে দুটি মন্ত্রণালয়ের অধীনে তিনটি আলাদা কর্তৃপক্ষের হাতে, ফলে সমন্বয়ের অভাব ও তথ্যে ভুলের সুযোগ তৈরি হয় [4]। মূল রেকর্ড খতিয়ানেও পরিচিত কিছু ভুল থাকে: কেরানির ভুল, কর্মকর্তার ভুল, এবং উত্তরাধিকার ও জমি ভাগ থেকে আসা ভুল [2]। তাই সংস্কার-সংক্রান্ত গবেষণায় নিবন্ধনের আগে নিবন্ধন কর্মকর্তা ও সহকারী কমিশনার (ভূমি)-র মধ্যে পারস্পরিক যাচাই, এবং লেনদেনের চেষ্টা হলে মালিককে সতর্কবার্তা পাঠানোর কথা বলা হয়েছে [3]।'],
  stat=('৭০%+','দেওয়ানি বিরোধ জমি-সংক্রান্ত দ্বন্দ্ব থেকে আসে, আইন মন্ত্রণালয়ের তথ্য অনুযায়ী (সংবাদমাধ্যমে প্রকাশিত) [10]'),
  slips=('আজ যা ফসকে যায়','একই অংশ দুইবার বিক্রি · মালিকানার চেয়ে বেশি জমি বিক্রি · রেকর্ডে খাস দেখানো জমির দলিল · দলিলের চেয়ে ভিন্ন পরিমাণের নামজারি।'),
  p1b=['ডিজিটাল সেবা সহজলভ্যতা বাড়িয়েছে: ই-নামজারিতে নাগরিকের সময়, খরচ ও যাতায়াত কমেছে, তবে সমন্বয়ের সমস্যা ও ভুল জরিপ-রেকর্ড রয়ে গেছে [5]; গ্রামীণ ব্যবহারকারীরা এখনও ডিজিটাল দক্ষতার অভাব, দুর্বল ইন্টারনেট ও মধ্যস্থতাকারীর ওপর নির্ভরতার মুখে পড়েন [7]। বাংলাদেশের জন্য ব্লকচেইনভিত্তিক ভূমি-স্বত্ব প্রস্তাব স্বত্ব সংরক্ষণ ও সুরক্ষা করে [6]; লেনদেন গ্রহণের আগে দলিলে অসংগতি আছে কি না, তা যাচাই করে না। আমাদের নিজস্ব প্রাথমিক অনুসন্ধানে [11] লেনদেনের আগে কারণসহ এই যাচাই-ধাপটি কম চোখে পড়েছে (এটি অনুসন্ধানের ছাপ, নিয়মমাফিক পর্যালোচনা নয়)।',
         '<b>কারা ব্যবহার করবেন:</b> সাব-রেজিস্ট্রার (প্রধান), নামজারির জন্য এসি ল্যান্ড কর্মকর্তা, এবং নাগরিক ও ক্রেতা। পরে ব্যাংক ও আদালত।'],
  p2=['<b>Ardh Guard</b> একটি ব্যাখ্যাযোগ্য অসংগতি-শনাক্তকরণ স্তর, যার দুটি ধাপ: <b>নিবন্ধনের আগে</b> ও <b>নামজারির আগে</b>। এটি দলিলকে রেকর্ডের ধারা (সিএস, এসএ, আরএস ও বিএস খতিয়ান), বিক্রেতার আগের দলিল ও নামজারির ইতিহাসের সঙ্গে মিলিয়ে দেখে এবং <b>সহজ ভাষায় কারণসহ</b> কর্মকর্তার কাছে মামলাটি তুলে ধরে। এটি কখনো মালিকানা নির্ধারণ করে না। প্রতিটি যাচাই একটি পড়ার মতো নিয়ম, তাই কর্মকর্তা নাগরিকের কাছে প্রত্যাখ্যানের কারণ ব্যাখ্যা করতে পারেন।'],
  chips=[('h','একই জমি একাধিকবার বিক্রি'),('h','মালিকানার চেয়ে বেশি জমি বিক্রি'),('h','সরকারি (খাস) জমি'),('h','রেকর্ডে বিক্রেতার নাম নেই'),('h','দলিল পরিবর্তিত বা জাল (QR, স্বাক্ষর)'),('r','নামজারি দলিলের সঙ্গে মেলেনি'),('r','দলিল নিবন্ধিত, নামজারি হয়নি'),('n','প্রত্যাখ্যানের পর নামজারি আবার দাখিল')],
  legend='আটকে রাখুন · পর্যালোচনা · টীকা',
  flow=[('আবেদন আসে','দলিল বা নামজারি'),('Ardh Guard মেলায়','রেকর্ডের ধারা, আগের দলিল'),('কারণসহ সতর্কবার্তা','সহজ ভাষা, খুলে দেখার রেকর্ড'),('কর্মকর্তা সিদ্ধান্ত নেন','আটকে রাখা, বাতিল, ঊর্ধ্বতনের কাছে')],
  figflow='চিত্র ১. একটি যাচাইয়ের ধাপগুলো।',
  p3=['<b>ইঞ্জিন:</b> খাঁটি TypeScript ফাংশন। ইনপুট: রেজিস্ট্রি (দলিল, খতিয়ানের ধারা, নামজারি)। আউটপুট: কাঠামোবদ্ধ কারণসহ সতর্কবার্তা, যা ইন্টারফেস বাংলা বা ইংরেজিতে প্রকাশ করে।',
      '<b>ইন্টারফেস:</b> React [13], Vite [14] ও Tailwind CSS [15], Vercel [16]-এ হোস্ট করা। ডিফল্ট ভাষা বাংলা, ইংরেজিতে বদলানো যায়; নাগরিক/ক্রেতা, কর্মকর্তা/অ্যাডমিন বা উভয় দেখা।',
      '<b>ডেটা:</b> কাল্পনিক রেজিস্ট্রি (৩টি মৌজা, ২৪টি জমি, ৯৬টি খতিয়ান, ২৫টি দলিল, ২৩টি নামজারি কেস, ৯টি ইচ্ছা করে বসানো অসংগতি)। কোনো প্রকৃত মানুষ, এনআইডি, ফোন নম্বর বা ভূমি রেকর্ড নেই, কোথাও থেকে স্ক্র্যাপও করা হয়নি, যেমনটি নিয়মাবলি চায় [1]।',
      '<b>মূল্যায়ন:</b> যাচাইযোগ্য ৮টি বসানো অসংগতির ৮টিই নিয়মগুলো ধরেছে, এবং তার বাইরে কোনো সতর্কবার্তা ওঠেনি। এটি <b>রিগ্রেশন টেস্ট, নির্ভুলতা নয়</b>: ডেটা ছোট, আর ডেটা জেনেই নিয়ম লেখা হয়েছে।'],
  features=['নিবন্ধনের আগে দলিল যাচাই: পূর্ণ অডিট ভিউ, যেখানে ফলাফল, পাস/ব্যর্থ যাচাই, রেকর্ডের ধারা ও ডাউনলোডযোগ্য প্রতিবেদন (HTML, JSON, PDF)।','কর্মকর্তাদের সতর্কবার্তার তালিকা: আটকে রাখা নিশ্চিত করা, বাতিল বা ঊর্ধ্বতনের কাছে পাঠানো।','জমির পাতা: সিএস, এসএ, আরএস, বিএস ধারা, দলিল ও নামজারি একসঙ্গে।','নাগরিকের “কেনার আগে যাচাই” পাতা, যেখানে অন্যের দলিলের কিছুই দেখানো হয় না।','বাংলা (ডিফল্ট) ও ইংরেজি; নাগরিক, কর্মকর্তা ও উভয় দেখা।','হালকা ও গাঢ় থিম; সতর্কবার্তা ও বেঞ্চমার্কের CSV; অ্যাপের ভেতরেই বেঞ্চমার্ক, কীভাবে কাজ করে এবং রোডম্যাপ ও সীমাবদ্ধতার পাতা।'],
  path=[('পাইলট','আনুষ্ঠানিক তথ্য-বিনিময় চুক্তির আওতায় একটি সাব-রেজিস্ট্রি অফিস ও তার এসি ল্যান্ড অফিস, শুরুতে শুধু পড়া ও শ্যাডো মোডে, প্রতিটি তথ্যসূত্র মালিক অফিসের সম্মতিতে।'),('সম্প্রসারণ','উপজেলা ধরে ধরে, তারপর জেলা। ইঞ্জিন ব্রাউজারেই চলে, তাই অবকাঠামো কম লাগে।'),('পূর্বশর্ত','পরিষ্কার ও সংযুক্ত জমির ইতিহাস। বিভিন্ন জরিপের দাগ মেলানোই সবচেয়ে কঠিন খোলা প্রশ্ন, আমরা তা খোলাখুলি বলছি।'),('জবাবদিহি','সব সিদ্ধান্ত কর্মকর্তার হাতে। বাস্তব ব্যবহারের আগে লগইন, ভূমিকা ও অডিট ট্রেইল আসবে।')],
  next=[('v1.1 · চূড়ান্ত রাউন্ড',['ধারাবাহিক মালিকানার পরীক্ষার ডেটা ও ধারা-ভাঙা শনাক্তের নিয়ম','মালিককে সতর্কবার্তা, বিরোধ-স্থগিত, অডিট ট্রেইলসহ সিদ্ধান্ত সংরক্ষণ (Supabase [17]), লগইন ও ভূমিকা','বাংলা নাম মেলানো; “তথ্য অনুপস্থিত বা পুরোনো” ফলাফল; ভুল সতর্কবার্তা মাপার জন্য “অগোছালো কিন্তু নির্দোষ” বেঞ্চমার্ক','AI: আগে থেকে প্রশিক্ষিত ভাষা মডেল দিয়ে বাংলা ও ইংরেজি সারসংক্ষেপ, কর্মকর্তা দেখে নিয়ে']),
        ('v2 · হ্যাকাথনের পর',['জরিপের মধ্যে দাগ মেলানো; পাইলট','AI: স্ক্যান করা খতিয়ান ও দলিল পড়তে বাংলা OCR (আগে থেকে প্রশিক্ষিত), কর্মকর্তার নিশ্চিতকরণসহ','AI: নিয়মের পরে মেশিন লার্নিংভিত্তিক ঝুঁকি-ক্রম, বাস্তবসম্মত ডেটা পাওয়ার পর, নিয়ম ও কারণ রেখে','বন্ধক, মামলা, ভেস্টেড সম্পত্তি ও ভূমি উন্নয়ন কর যাচাই, প্রতিটির জন্য মালিক অফিসের তথ্যসূত্র লাগবে','ক্যাডাস্ট্রাল মানচিত্র; পরিচয় যাচাই শুধু আইনি ভিত্তি ও সম্মতি থাকলে, কখনো বায়োমেট্রিক নয়'])],
  aiNote='AI-সংক্রান্ত সবকিছু পরিকল্পনা; আগে থেকে প্রশিক্ষিত মডেল আসবে Hugging Face [18]-এর মতো প্ল্যাটফর্ম থেকে। আজ প্রোটোটাইপে কোনো AI মডেল চলে না।',
  limits='<b>সীমাবদ্ধতা:</b> শুধু ডামি ডেটা; ছোট বেঞ্চমার্ক; ধারা-ভাঙা শনাক্তের পরীক্ষা হয়নি; নাম হুবহু মেলানো হয়; ভূমিকা পরিবর্তন ডেমো নিয়ন্ত্রণ, প্রবেশাধিকার নিয়ন্ত্রণ নয়; বন্ধক, মামলা, ভেস্টেড সম্পত্তি ও কর যাচাই এখনো নেই।',
  team='<b>জোবায়ের</b> (দলনেতা, @MJZ-Hossen) · <b>এস.এম. মেহেদী কাউসার</b> (@mehedyk) · শিক্ষক মেন্টর: জান্নাতুল মাওয়া কলি · ইন্ডাস্ট্রি মেন্টর: মো. তাহামিদ হাসান সাদিব (সিএসই-টেক)। <b>ব্যবহৃত AI টুল:</b> পরিকল্পনা এবং কোড ও নথির খসড়ায় Claude [12]; অনুসন্ধানের জন্য Consensus [11]।',
)

# ───────────────────────── rendering ─────────────────────────
def cited_ids(c):
    text = json.dumps(c, ensure_ascii=False)
    ids = []
    for m in MARK.findall(text):
        if m in REFS and m not in ids:
            ids.append(m)
    return sorted(ids, key=int)

def linkify(s):  # inline [n] -> superscript link to the entry in the reference list
    return MARK.sub(lambda m: f'<sup class="r"><a href="#r{m.group(1)}">[{m.group(1)}]</a></sup>' if m.group(1) in REFS else m.group(0), s)

def esc_amp(s):
    return s.replace('&', '&amp;')

def ref_li(i):
    r = REFS[i]
    return f'<li id="r{i}"><b>[{i}]</b> {esc_amp(r["cite"])} <a href="{r["url"]}">{esc_amp(r["title"])}</a></li>'

def b2m(s):  # <b>..</b> -> **..**
    return re.sub(r'</?b>', '**', s)

def build_html(c, img_b64):
    L = linkify
    chips = ''.join(f'<span class="chip {k}">{t}</span>' for k, t in c['chips'])
    flow = ''.join(f'<div class="step"><b>{i+1}. {a}</b><span>{b}</span></div>' for i, (a, b) in enumerate(c['flow']))
    feats = ''.join(f'<li>{L(x)}</li>' for x in c['features'])
    path = ''.join(f'<div class="ph"><b>{a}</b><span>{L(b)}</span></div>' for a, b in c['path'])
    nxt = ''.join(f'<div><h4>{t}</h4><ul>{"".join(f"<li>{L(x)}</li>" for x in items)}</ul></div>' for t, items in c['next'])
    refs = ''.join(ref_li(i) for i in cited_ids(c))
    p1 = ''.join(f'<p>{L(x)}</p>' for x in c['p1'])
    p1b = ''.join(f'<p>{L(x)}</p>' for x in c['p1b'])
    p3 = ''.join(f'<li>{L(x)}</li>' for x in c['p3'])
    h = c['h']
    return f'''<!doctype html><html lang="{c['lang']}"><head><meta charset="utf-8"><title>{c['title']}</title><style>@font-face{{font-family:'Kalpurush';src:url('{FONT}');unicode-range:U+0980-09FF,U+0964-0965,U+200C-200D}}
@page{{size:A4;margin:0}}
*{{box-sizing:border-box}}
:root{{--ink:#0f1f26;--body:#26373e;--brand:#0f766e;--soft:#d9f1ed;--line:#d3dfdf;--amber:#8a5200;--amberS:#fdf0d3;--red:#b42318;--redS:#fde7e4}}
html,body{{margin:0;font-family:'Kalpurush','Inter','Segoe UI','Nirmala UI','Noto Sans Bengali',Arial,sans-serif;color:var(--body);font-size:{9.6 if c['lang']=='bn' else 10.1}pt;line-height:{1.5 if c['lang']=='bn' else 1.45}}}
.page{{width:210mm;height:297mm;padding:13mm 15mm 11mm 18mm;position:relative;overflow:hidden;page-break-after:always;break-after:page;background:#fff}}
.page::before{{content:"";position:absolute;left:0;top:0;bottom:0;width:6mm;background:var(--brand)}}
.page.first::before{{background:linear-gradient(var(--brand),#f59e0b)}}
h1{{font-size:18.5pt;line-height:1.25;margin:0 0 2mm;color:var(--ink)}}
h2{{font-size:13pt;margin:5mm 0 1.8mm;color:var(--brand);border-bottom:1.2px solid var(--line);padding-bottom:1mm}}
h4{{margin:0 0 1mm;font-size:10pt;color:var(--ink)}}
p{{margin:0 0 2mm}} ul{{margin:0;padding-left:4.2mm}} li{{margin:0 0 1mm}}
.head{{display:flex;gap:4mm;align-items:center;margin-bottom:2.5mm}} .head img{{width:15mm;height:15mm}}
.sub{{font-size:8.6pt;color:#3d5159}} .links{{font-size:8.6pt;margin-top:1mm}}
a{{color:var(--brand);text-decoration:none}} sup.r{{font-size:6.8pt;line-height:0}} sup.r a{{font-weight:700}}
.stat{{display:flex;gap:4mm;align-items:center;background:var(--soft);border-left:2.2mm solid var(--brand);padding:2.4mm 4mm;margin:1mm 0 2.4mm;border-radius:1mm}}
.stat b{{font-size:21pt;color:var(--brand);line-height:1}} .stat span{{font-size:9.2pt;color:var(--ink)}}
.slip{{background:var(--redS);border-left:2.2mm solid var(--red);padding:2mm 4mm;margin:0 0 2.4mm;border-radius:1mm;color:#5a1710}}
.chips{{display:flex;flex-wrap:wrap;gap:1.6mm;margin:1.5mm 0}} .chip{{padding:1.1mm 2.6mm;border-radius:1.2mm;font-size:8.4pt;font-weight:600;border-left:1.6mm solid}}
.chip.h{{background:var(--redS);border-color:var(--red);color:#5a1710}} .chip.r{{background:var(--amberS);border-color:var(--amber);color:#5c3700}} .chip.n{{background:#eaf1f1;border-color:#9fb4b4}}
.legend{{font-size:8pt;color:#3d5159}}
.flow{{display:grid;grid-template-columns:repeat(4,1fr);gap:2.5mm;margin:1.5mm 0 1mm}}
.step{{border-top:1.2mm solid var(--brand);padding-top:1.6mm}} .step b{{display:block;color:var(--ink);font-size:9.2pt}} .step span{{font-size:8.2pt}}
.cap{{font-size:7.8pt;color:#3d5159;margin:0.8mm 0 2mm}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:6mm;align-items:start}}
.shot{{width:100%;border:0.4mm solid var(--line);border-radius:1.2mm}}
.warn{{background:var(--amberS);border-left:2.2mm solid var(--amber);padding:2mm 4mm;border-radius:1mm;color:#5c3700;margin:1.5mm 0}}
.path{{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}} .ph{{border-top:1.2mm solid var(--brand);padding-top:1.6mm}} .ph b{{display:block;color:var(--ink)}} .ph span{{font-size:9pt}}
.next{{display:grid;grid-template-columns:1fr 1fr;gap:5mm}}
.refs{{columns:2;column-gap:6mm;font-size:7.5pt;line-height:1.32;padding-left:0;list-style:none;margin:0}} .refs li{{margin:0 0 1.1mm;break-inside:avoid}}
.team{{border-top:1px solid var(--line);margin-top:2mm;padding-top:2mm}}
</style></head><body>

<section class="page first">
 <div class="head"><img src="data:image/svg+xml;base64,{LOGO}" alt=""><div><h1>{c['title']}</h1></div></div>
 <div class="sub">{L(c['sub'])}</div><div class="links">{L(c['links'])}</div>
 <h2>{h[0]}</h2>{p1}
 <div class="stat"><b>{c['stat'][0]}</b><span>{L(c['stat'][1])}</span></div>
 <div class="slip"><b>{c['slips'][0]}:</b> {c['slips'][1]}</div>
 {p1b}
 <h2>{h[1]}</h2>{''.join(f'<p>{L(x)}</p>' for x in c['p2'])}
 <div class="chips">{chips}</div><div class="legend">{c['legend']}</div>
</section>

<section class="page">
 <h2 style="margin-top:0">{h[2]}</h2>
 <div class="flow">{flow}</div><div class="cap">{c['figflow']}</div>
 <div class="two"><div><ul>{p3}</ul></div><div><img class="shot" src="data:image/png;base64,{img_b64}" alt=""><div class="cap">{c['figcap']}</div></div></div>
 <h2>{h[3]}</h2><ul>{feats}</ul>
 <h2>{h[4]}</h2><div class="path">{path}</div>
</section>

<section class="page">
 <h2 style="margin-top:0">{h[5]}</h2><div class="next">{nxt}</div>
 <div class="warn">{L(c['aiNote'])}</div><p>{L(c['limits'])}</p>
 <h2>{h[6]}</h2><p>{L(c['team'])}</p>
 <h2>{h[7]}</h2><ol class="refs" style="list-style:none;padding:0">{refs}</ol>
</section></body></html>'''

def build_md(c):
    L = b2m
    md = [f"# {c['title']}", '', c['sub'], '', c['links'], '', f"## {c['h'][0]}", '']
    md += [L(x) + '\n' for x in c['p1']]
    md += [f"> **{c['stat'][0]}** {c['stat'][1]}", '', f"**{c['slips'][0]}:** {c['slips'][1]}", '']
    md += [L(x) + '\n' for x in c['p1b']]
    md += [f"## {c['h'][1]}", ''] + [L(x) + '\n' for x in c['p2']]
    md += ['- ' + t for _, t in c['chips']] + ['', f"## {c['h'][2]}", '', '_Figure 1: ' + c['figflow'] + '_  ' + ' → '.join(a for a, _ in c['flow']), '']
    md += ['- ' + L(x) for x in c['p3']] + ['', f"## {c['h'][3]}", ''] + ['- ' + L(x) for x in c['features']]
    md += ['', f"## {c['h'][4]}", ''] + [f"{i+1}. **{a}:** {b}" for i, (a, b) in enumerate(c['path'])]
    md += ['', f"## {c['h'][5]}", '']
    for t, items in c['next']:
        md += [f"**{t}**", ''] + ['- ' + x for x in items] + ['']
    md += [f"> {c['aiNote']}", '', L(c['limits']), '', f"## {c['h'][6]}", '', L(c['team']), '']
    return '\n'.join(md)

FONT = 'data:font/ttf;base64,' + base64.b64encode(open(os.path.join(ROOT, 'public', 'fonts', 'Kalpurush.ttf'), 'rb').read()).decode()
LOGO = base64.b64encode(open(os.path.join(ROOT, 'assets', 'logo-mark.svg'), 'rb').read()).decode()
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for c in (EN, BN):
        img = base64.b64encode(open(os.path.join(ROOT, 'docs', 'media', c['img']), 'rb').read()).decode()
        html = build_html(c, img)
        open(os.path.join(OUT, c['file'] + '.html'), 'w', encoding='utf-8').write(html)
        open(os.path.join(OUT, 'CONCEPT_NOTE.' + c['lang'] + '.md'), 'w', encoding='utf-8').write(build_md(c))
        pg = b.new_page(); pg.goto('file://' + os.path.abspath(os.path.join(OUT, c['file'] + '.html'))); pg.wait_for_timeout(500)
        over = pg.evaluate("[...document.querySelectorAll('.page')].map(p=>p.scrollHeight-p.clientHeight)")
        pg.emulate_media(media='print')
        pdf = os.path.join(OUT, c['file'] + '.pdf')
        pg.pdf(path=pdf, width='210mm', height='297mm', print_background=True, prefer_css_page_size=True)
        print(c['lang'], 'overflow per page (px, must be <= 0):', over)
    b.close()
