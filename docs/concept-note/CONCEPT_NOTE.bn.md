# Ardh Guard: নিবন্ধন ও নামজারির আগে দলিলের অসংগতি ধরার ব্যাখ্যাযোগ্য ব্যবস্থা

টিম Ardh · ল্যান্ডটেক ইনোভেশন হ্যাকাথন ২০২৬ · ট্র্যাক: ডিজিটাল ভূমি রেকর্ড, যাচাইকরণ ও ডিজিটাইজেশন · সমস্যা P3: জালিয়াতি ও একই জমি একাধিকবার বিক্রি শনাক্তকরণ [1]

লাইভ প্রোটোটাইপ [19] · পিচ ডেক [20] · কোড: পাবলিক গিটহাব রিপোজিটরি, জমাদানের ফর্মে লিংক দেওয়া

## ১. সমস্যা এবং কেন এটি গুরুত্বপূর্ণ

বাংলাদেশে জমির লেনদেন এমন কয়েকটি অফিসের ভেতর দিয়ে যায়, যাদের হাতে রেকর্ডের একটি অভিন্ন, হালনাগাদ চিত্র থাকে না। জমির রেকর্ড, নিবন্ধন ও ব্যবস্থাপনা চলে দুটি মন্ত্রণালয়ের অধীনে তিনটি আলাদা কর্তৃপক্ষের হাতে, ফলে সমন্বয়ের অভাব ও তথ্যে ভুলের সুযোগ তৈরি হয় [4]। মূল রেকর্ড খতিয়ানেও পরিচিত কিছু ভুল থাকে: কেরানির ভুল, কর্মকর্তার ভুল, এবং উত্তরাধিকার ও জমি ভাগ থেকে আসা ভুল [2]। তাই সংস্কার-সংক্রান্ত গবেষণায় নিবন্ধনের আগে নিবন্ধন কর্মকর্তা ও সহকারী কমিশনার (ভূমি)-র মধ্যে পারস্পরিক যাচাই, এবং লেনদেনের চেষ্টা হলে মালিককে সতর্কবার্তা পাঠানোর কথা বলা হয়েছে [3]।

> **৭০%+** দেওয়ানি বিরোধ জমি-সংক্রান্ত দ্বন্দ্ব থেকে আসে, আইন মন্ত্রণালয়ের তথ্য অনুযায়ী (সংবাদমাধ্যমে প্রকাশিত) [10]

**আজ যা ফসকে যায়:** একই অংশ দুইবার বিক্রি · মালিকানার চেয়ে বেশি জমি বিক্রি · রেকর্ডে খাস দেখানো জমির দলিল · দলিলের চেয়ে ভিন্ন পরিমাণের নামজারি।

ডিজিটাল সেবা সহজলভ্যতা বাড়িয়েছে: ই-নামজারিতে নাগরিকের সময়, খরচ ও যাতায়াত কমেছে, তবে সমন্বয়ের সমস্যা ও ভুল জরিপ-রেকর্ড রয়ে গেছে [5]; গ্রামীণ ব্যবহারকারীরা এখনও ডিজিটাল দক্ষতার অভাব, দুর্বল ইন্টারনেট ও মধ্যস্থতাকারীর ওপর নির্ভরতার মুখে পড়েন [7]। বাংলাদেশের জন্য ব্লকচেইনভিত্তিক ভূমি-স্বত্ব প্রস্তাব স্বত্ব সংরক্ষণ ও সুরক্ষা করে [6]; লেনদেন গ্রহণের আগে দলিলে অসংগতি আছে কি না, তা যাচাই করে না। আমাদের নিজস্ব প্রাথমিক অনুসন্ধানে [11] লেনদেনের আগে কারণসহ এই যাচাই-ধাপটি কম চোখে পড়েছে (এটি অনুসন্ধানের ছাপ, নিয়মমাফিক পর্যালোচনা নয়)।

**কারা ব্যবহার করবেন:** সাব-রেজিস্ট্রার (প্রধান), নামজারির জন্য এসি ল্যান্ড কর্মকর্তা, এবং নাগরিক ও ক্রেতা। পরে ব্যাংক ও আদালত।

## ২. আমাদের সমাধান: Ardh Guard

**Ardh Guard** একটি ব্যাখ্যাযোগ্য অসংগতি-শনাক্তকরণ স্তর, যার দুটি ধাপ: **নিবন্ধনের আগে** ও **নামজারির আগে**। এটি দলিলকে রেকর্ডের ধারা (সিএস, এসএ, আরএস ও বিএস খতিয়ান), বিক্রেতার আগের দলিল ও নামজারির ইতিহাসের সঙ্গে মিলিয়ে দেখে এবং **সহজ ভাষায় কারণসহ** কর্মকর্তার কাছে মামলাটি তুলে ধরে। এটি কখনো মালিকানা নির্ধারণ করে না। প্রতিটি যাচাই একটি পড়ার মতো নিয়ম, তাই কর্মকর্তা নাগরিকের কাছে প্রত্যাখ্যানের কারণ ব্যাখ্যা করতে পারেন।

- একই জমি একাধিকবার বিক্রি
- মালিকানার চেয়ে বেশি জমি বিক্রি
- সরকারি (খাস) জমি
- রেকর্ডে বিক্রেতার নাম নেই
- দলিল পরিবর্তিত বা জাল (QR, স্বাক্ষর)
- নামজারি দলিলের সঙ্গে মেলেনি
- দলিল নিবন্ধিত, নামজারি হয়নি
- প্রত্যাখ্যানের পর নামজারি আবার দাখিল

## ৩. কীভাবে কাজ করে

_Figure 1: চিত্র ১. একটি যাচাইয়ের ধাপগুলো।_  আবেদন আসে → Ardh Guard মেলায় → কারণসহ সতর্কবার্তা → কর্মকর্তা সিদ্ধান্ত নেন

- **ইঞ্জিন:** খাঁটি TypeScript ফাংশন। ইনপুট: রেজিস্ট্রি (দলিল, খতিয়ানের ধারা, নামজারি)। আউটপুট: কাঠামোবদ্ধ কারণসহ সতর্কবার্তা, যা ইন্টারফেস বাংলা বা ইংরেজিতে প্রকাশ করে।
- **ইন্টারফেস:** React [13], Vite [14] ও Tailwind CSS [15], Vercel [16]-এ হোস্ট করা। ডিফল্ট ভাষা বাংলা, ইংরেজিতে বদলানো যায়; নাগরিক/ক্রেতা, কর্মকর্তা/অ্যাডমিন বা উভয় দেখা।
- **ডেটা:** কাল্পনিক রেজিস্ট্রি (৩টি মৌজা, ২৪টি জমি, ৯৬টি খতিয়ান, ২৫টি দলিল, ২৩টি নামজারি কেস, ৯টি ইচ্ছা করে বসানো অসংগতি)। কোনো প্রকৃত মানুষ, এনআইডি, ফোন নম্বর বা ভূমি রেকর্ড নেই, কোথাও থেকে স্ক্র্যাপও করা হয়নি, যেমনটি নিয়মাবলি চায় [1]।
- **মূল্যায়ন:** যাচাইযোগ্য ৮টি বসানো অসংগতির ৮টিই নিয়মগুলো ধরেছে, এবং তার বাইরে কোনো সতর্কবার্তা ওঠেনি। এটি **রিগ্রেশন টেস্ট, নির্ভুলতা নয়**: ডেটা ছোট, আর ডেটা জেনেই নিয়ম লেখা হয়েছে।

## ৪. মূল বৈশিষ্ট্য

- নিবন্ধনের আগে দলিল যাচাই: পূর্ণ অডিট ভিউ, যেখানে ফলাফল, পাস/ব্যর্থ যাচাই, রেকর্ডের ধারা ও ডাউনলোডযোগ্য প্রতিবেদন (HTML, JSON, PDF)।
- কর্মকর্তাদের সতর্কবার্তার তালিকা: আটকে রাখা নিশ্চিত করা, বাতিল বা ঊর্ধ্বতনের কাছে পাঠানো।
- জমির পাতা: সিএস, এসএ, আরএস, বিএস ধারা, দলিল ও নামজারি একসঙ্গে।
- নাগরিকের “কেনার আগে যাচাই” পাতা, যেখানে অন্যের দলিলের কিছুই দেখানো হয় না।
- বাংলা (ডিফল্ট) ও ইংরেজি; নাগরিক, কর্মকর্তা ও উভয় দেখা।
- কাল্পনিক জমির মানচিত্র (আরএস ও বিএস), আঙুলের ছাপের সিমুলেশন ও বন্ধ এনআইডি ঘর; কর্মকর্তা ও নাগরিকের দেখা পাশাপাশি; হালকা ও গাঢ় থিম; সতর্কবার্তা ও বেঞ্চমার্কের CSV; অ্যাপের ভেতরেই বেঞ্চমার্ক, কীভাবে কাজ করে এবং রোডম্যাপ ও সীমাবদ্ধতার পাতা।

## ৫. সারা দেশে ব্যবহারের পথ

1. **পাইলট:** আনুষ্ঠানিক তথ্য-বিনিময় চুক্তির আওতায় একটি সাব-রেজিস্ট্রি অফিস ও তার এসি ল্যান্ড অফিস, শুরুতে শুধু পড়া ও শ্যাডো মোডে, প্রতিটি তথ্যসূত্র মালিক অফিসের সম্মতিতে।
2. **সম্প্রসারণ:** উপজেলা ধরে ধরে, তারপর জেলা। ইঞ্জিন ব্রাউজারেই চলে, তাই অবকাঠামো কম লাগে।
3. **পূর্বশর্ত:** পরিষ্কার ও সংযুক্ত জমির ইতিহাস। বিভিন্ন জরিপের দাগ মেলানোই সবচেয়ে কঠিন খোলা প্রশ্ন, আমরা তা খোলাখুলি বলছি।
4. **জবাবদিহি:** সব সিদ্ধান্ত কর্মকর্তার হাতে। বাস্তব ব্যবহারের আগে লগইন, ভূমিকা ও অডিট ট্রেইল আসবে।

## ৬. আমরা এরপর যা করব

**v1.1 · চূড়ান্ত রাউন্ড**

- ধারাবাহিক মালিকানার পরীক্ষার ডেটা ও ধারা-ভাঙা শনাক্তের নিয়ম
- মালিককে সতর্কবার্তা, বিরোধ-স্থগিত, অডিট ট্রেইলসহ সিদ্ধান্ত সংরক্ষণ (Supabase [17]), লগইন ও ভূমিকা
- বাংলা নাম মেলানো; “তথ্য অনুপস্থিত বা পুরোনো” ফলাফল; ভুল সতর্কবার্তা মাপার জন্য “অগোছালো কিন্তু নির্দোষ” বেঞ্চমার্ক
- AI: আগে থেকে প্রশিক্ষিত ভাষা মডেল দিয়ে বাংলা ও ইংরেজি সারসংক্ষেপ, কর্মকর্তা দেখে নিয়ে

**v2 · হ্যাকাথনের পর**

- জরিপের মধ্যে দাগ মেলানো; পাইলট
- AI: স্ক্যান করা খতিয়ান ও দলিল পড়তে বাংলা OCR (আগে থেকে প্রশিক্ষিত), কর্মকর্তার নিশ্চিতকরণসহ
- AI: নিয়মের পরে মেশিন লার্নিংভিত্তিক ঝুঁকি-ক্রম, বাস্তবসম্মত ডেটা পাওয়ার পর, নিয়ম ও কারণ রেখে
- বন্ধক, মামলা, ভেস্টেড সম্পত্তি ও ভূমি উন্নয়ন কর যাচাই, প্রতিটির জন্য মালিক অফিসের তথ্যসূত্র লাগবে
- ক্যাডাস্ট্রাল মানচিত্র; পরিচয় যাচাই শুধু আইনি ভিত্তি ও সম্মতি থাকলে, কখনো বায়োমেট্রিক নয়

> AI-সংক্রান্ত সবকিছু পরিকল্পনা; আগে থেকে প্রশিক্ষিত মডেল আসবে Hugging Face [18]-এর মতো প্ল্যাটফর্ম থেকে। আজ প্রোটোটাইপে কোনো AI মডেল চলে না।

**সীমাবদ্ধতা:** শুধু ডামি ডেটা; ছোট বেঞ্চমার্ক; ধারা-ভাঙা শনাক্তের পরীক্ষা হয়নি; নাম হুবহু মেলানো হয়; ভূমিকা পরিবর্তন ডেমো নিয়ন্ত্রণ, প্রবেশাধিকার নিয়ন্ত্রণ নয়; বন্ধক, মামলা, ভেস্টেড সম্পত্তি ও কর যাচাই এখনো নেই।

## ৭. দল ও ব্যবহৃত টুল

**জোবায়ের** (দলনেতা, @MJZ-Hossen) · **এস.এম. মেহেদী কাউসার** (@mehedyk) · শিক্ষক মেন্টর: জান্নাতুল মাওয়া কলি · ইন্ডাস্ট্রি মেন্টর: মো. তাহামিদ হাসান সাদিব (সিএসই-টেক)। **ব্যবহৃত AI টুল:** পরিকল্পনা এবং কোড ও নথির খসড়ায় Claude [12]; অনুসন্ধানের জন্য Consensus [11]।

<!-- refs:start -->
## References

[1] LandTech Innovation Hackathon 2026 Rule Book, version 1.2. Department of CSE and CSE-TECH, Daffodil International University. [LandTech Innovation Hackathon 2026 Rule Book (v1.2)](https://landtech.diu.edu.bd/landtech)  
[2] Raziv, M. M. H., Jalil, M. A., Mia, M. T. and Mahmud, F. U. (2024). Journal of Asian and African Social Science and Humanities, 10(2), 31-44. [Errors in the Land Record of Rights (Khatiyan) and the Remedial Procedure in Bangladesh: An Analysis of Existing Regulatory Framework and Future Reforms](https://doi.org/10.55327/jaash.v10i2.335)  
[3] Ayatullah, M. (2024). Feni University Journal, 3(1), 211-222. [Essentiality of Reforms of the Registration Act 1908: E-Registration Perspective](https://doi.org/10.3329/fuj.v3i1.86557)  
[4] Emam, J. (2022). Bangladesh Journal of Public Administration, 30(2), 47-62. [The Prospect of Integrated Land Administration and Management System (ILAMS) for Improving Land Related Service Delivery in Bangladesh](https://doi.org/10.36609/bjpa.v30i2.360)  
[5] Begum, S. (2023). Asian Journal of Social Sciences and Legal Studies, 5(6), 291-305. [Citizens' Perspective on Land E-Mutation at Upazila Land Offices in Mymensingh](https://doi.org/10.34104/ajssls.023.02910305)  
[6] Alam, K. M., Rahman, J. M. A., Tasnim, A. and Akther, A. (2022). Journal of King Saud University - Computer and Information Sciences, 34, 3096-3110. [A Blockchain-based Land Title Management System for Bangladesh](https://doi.org/10.1016/j.jksuci.2020.10.011)  
[7] Debnath, A., Reza, S., Islam, M. R. and Rahman, M. A. (2026). Journal of Society and Progress, 1(1), 71-86. [Digitizing Land Governance in Bangladesh: A Qualitative Study of Urban and Rural Citizens' Experiences with the Digital Land Record Management System](https://doi.org/10.36481/jsp.v01.i01.3vmg5j09)  
[10] Ahana, S. I. (2025, 23 November). The Daily Observer. [Digitising land records seen as a paradigm shift](https://observerbd.com/news/555055)  
[11] Consensus (2026). AI-generated literature search reports used for scoping (P3 gap analysis; CS, SA, RS, BS chain; e-services). [Consensus: AI research assistant](https://consensus.app)  
[12] Anthropic. Claude, used for planning and for drafting code and documents. [Claude (Anthropic)](https://www.anthropic.com/claude)  
[13] React: the library for web and native user interfaces. [React](https://react.dev)  
[14] Vite: next generation frontend tooling. [Vite](https://vite.dev)  
[15] Tailwind CSS: a utility-first CSS framework. [Tailwind CSS](https://tailwindcss.com)  
[16] Vercel: hosting platform for the live prototype. [Vercel](https://vercel.com)  
[17] Supabase: Postgres development platform (planned for saving decisions and the audit trail). [Supabase](https://supabase.com)  
[18] Hugging Face: platform for pretrained models (planned source for roadmap AI features). [Hugging Face](https://huggingface.co)  
[19] Team Ardh (2026). Ardh Guard live prototype. [Ardh Guard: live prototype](https://land-tech-innovation-hackathon-2026.vercel.app/)  
[20] Team Ardh (2026). Ardh Guard pitch deck, interactive and bilingual. [Ardh Guard: pitch deck](https://land-tech-innovation-hackathon-2026.vercel.app/deck/)  

### Other project references

- [8] [The Impact of E-services on People's Empowerment: An Investigation into E-mutation Service of Bangladesh](https://doi.org/10.53808/KUS.2024.21.02.1177-ss)
- [9] [Digitalization of the Land Record System in Bangladesh: Prospects and Challenges](https://ssrn.com/abstract=5012153)
- [21] [Coordinated land registration, mutation to benefit over 1 crore people: Land secretary](https://www.tbsnews.net/bangladesh/coordinated-land-registration-mutation-benefit-over-1-crore-people-land-secretary-156184)
- [22] [Bangladesh's Personal Data Protection Ordinance 2025: key takeaways](https://www.thedailystar.net/tech-startup/news/bangladeshs-personal-data-protection-ordinance-2025-key-takeaways-4015401)
- [23] [EC to monitor partner organisations to protect NID data](https://www.tbsnews.net/node/664882)

Numbers are the same in every file. Full list with notes on what we read: [`docs/REFERENCES.md`](../REFERENCES.md).
<!-- refs:end -->
