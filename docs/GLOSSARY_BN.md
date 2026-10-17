# Bangla glossary: how terms were chosen

The rule: **translate by context, not word for word.** A word-for-word Bangla of a software or land term is often correct in a dictionary and wrong in the room. The same way "tree" in a data-structure lecture is not "গাছ", our terms follow what people in the land office and in software teams actually say. Please have a Bangla speaker on the team read every screen before submitting.

| English | Bangla used | Why not the literal word |
|---|---|---|
| deed | দলিল | The legal document of transfer. Not "চুক্তি" (contract) |
| khatian | খতিয়ান | Kept as the record's own name |
| CS / SA / RS / BS | সিএস / এসএ / আরএস / বিএস | The survey names as written in Bangla land documents |
| mutation | নামজারি | The official process of changing the record. Not "পরিবর্তন" (change) |
| plot | দাগ | Survey plot number (dag). Not "প্লট" (a housing plot) |
| decimal (land unit) | শতাংশ | The unit used in land records. Not "দশমিক" (the decimal point) |
| parcel | জমি | A piece of land tracked across surveys. "পার্সেল" would read as a courier parcel |
| sub-registry office | সাব-রেজিস্ট্রি অফিস | The name people use |
| AC Land office | এসি ল্যান্ড অফিস | Spoken form; "সহকারী কমিশনার (ভূমি)" in formal text |
| khas land | খাস জমি | Government-owned land |
| record chain | রেকর্ডের ধারা | A sequence of records. Not "শিকল" (an iron chain) |
| hold | আটকে রাখুন | An officer's action. Not "ধরুন" |
| alert | সতর্কবার্তা | A warning message. Not "এলার্ট" |
| officer / admin | কর্মকর্তা / অ্যাডমিন | Both words shown, because you called the role "admin" |
| citizen / customer | নাগরিক / ক্রেতা | In this app the customer is a land buyer, so "ক্রেতা" |
| escalate | ঊর্ধ্বতনের কাছে পাঠান | Says what happens. Not "এসকালেট" |
| audit trail | অডিট ট্রেইল | Term used in software and government IT |
| benchmark | বেঞ্চমার্ক | Kept as people say it |
| regression test | রিগ্রেশন টেস্ট (explained in a sentence) | The explanation is on the page: a test that the rules still behave as designed |
| dummy data | ডামি ডেটা | Same wording as the rulebook |
| rules engine | নিয়মভিত্তিক ইঞ্জিন | |
| explainable | ব্যাখ্যাযোগ্য | |
| QR code, OCR, AI | QR কোড, OCR, AI | Left in Latin letters, as written everywhere |
| pretrained model | আগে থেকে প্রশিক্ষিত মডেল | |
| false alarm | ভুল সতর্কবার্তা | |
| mortgage | বন্ধক | |
| land development tax | ভূমি উন্নয়ন কর (খাজনা) | Both words, since people say "খাজনা" |
| DCR | ডিসিআর (ভূমি উন্নয়ন কর রশিদ) | Check this expansion with a mentor |

## Decisions that need your call
- **The product name.** "Ardh Guard" is kept in Latin letters everywhere. If you want a Bangla spelling, "অর্ধ" means "half" (which fits the logo); do not use "আর্ধ", which is not a word.
- **Digits.** In Bangla mode, numbers in sentences use Bangla digits (২৭১.৯৫). Ids, deed numbers, dates and names stay as written in the data (L05, 3596/2019).
- **Names in the dummy data** are in Latin letters, so Bangla screens show English names. Bangla names in the seed are a v1.1 item (it also helps Bangla name matching).
