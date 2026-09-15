# FOUAD CLI

![FOUAD CLI](assets/fouad-banner.png)

أداة سطر أوامر لتنزيل الفيديو والصور والصوت من منصات التواصل الاجتماعي المدعومة.

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue)](LICENSE)

## المميزات

- دعم TikTok وInstagram وYouTube وFacebook وX/Twitter.
- دعم Spotify وApple Music وPinterest وCapCut وBluesky.
- دعم Douyin وRedNote وThreads وKuaishou وWeibo.
- اختيار الجودة والصيغة حسب المنصة.
- وضع تفاعلي وأوامر مباشرة.
- مجلد التنزيل الافتراضي `fouad_downloads`.

## المتطلبات

- Node.js 20 أو أحدث.
- npm واتصال بالإنترنت.

## التثبيت

```bash
git clone https://github.com/FOUAD_USERNAME/fouad-cli.git
cd fouad-cli
npm install
```

استبدل `FOUAD_USERNAME` باسم حساب Fouad على GitHub بعد نشر المستودع.

## التشغيل

```bash
npm start
```

يفتح هذا الأمر تطبيق Fouad الرسومي. يحفظ التطبيق الملفات تلقائيًا داخل
`~/Downloads/Fouad`، ويمكن فتح المجلد مباشرة من الواجهة.

لتشغيل الواجهة القديمة في الطرفية:

```bash
npm run cli
```

على Linux وmacOS وTermux يمكن أيضًا تشغيل `./fouad.sh`، وعلى Windows شغّل
`fouad.bat`.

## الأوامر

- `/help` عرض المساعدة.
- `/tutor` عرض شرح سريع.
- `/platform` عرض المنصات المدعومة.
- `/path` عرض مجلد التنزيل.
- `/setpath <directory>` تغيير مجلد التنزيل.
- `/clear` تنظيف الشاشة.
- `/quit` إغلاق الأداة.

تشغيل مباشر:

```bash
node index.js youtube "URL"
node index.js instagram "URL"
node index.js --path my_downloads tiktok "URL"
```

## الاستخدام المسؤول

نزّل فقط المحتوى الذي تملكه أو لديك إذن بتنزيله، والتزم بشروط المنصة والقوانين المعمول بها.

## الحقوق والترخيص

هوية FOUAD والتعديلات التي أُجريت سنة 2026:

Copyright © 2026 Fouad.

هذا المشروع نسخة معدّلة من برنامج مفتوح المصدر، ويوزّع وفق ترخيص
[GNU General Public License v3.0](LICENSE). يسمح الترخيص بالاستخدام والتعديل
والتوزيع، بما فيه التوزيع التجاري، بشرط الالتزام بكامل شروط GPL-3.0 وتوفير
المصدر والإبقاء على إشعارات الحقوق والترخيص. راجع [NOTICE](NOTICE) لمعرفة نسب
المصدر والتعديلات.

لا يقدم البرنامج أي ضمان.
