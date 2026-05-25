const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
// تفعيل CORS لكي نسمح لواجهة موقعك (Frontend) بالاتصال بهذا السيرفر بدون أي حظر
app.use(cors()); 

// رابط الـ API الجديد الذي ستطلبه من موقعك
app.get('/api/scrape-chapters', async (req, res) => {
    const targetUrl = req.query.url; // سنرسل رابط الفصل هنا

    if (!targetUrl) {
        return res.status(400).json({ error: "يرجى تزويدنا برابط الفصل المراد كشطه" });
    }

    try {
        // 1. دخول السيرفر للموقع وجلب كود الـ HTML بالكامل
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        // 2. تحميل الكود داخل مكتبة cheerio لبدء الكشط
        const $ = cheerio.load(response.data);
        const imageUrls = [];

        // 3. استهداف حاوية الصور (هنا كمثال نأخذ الصور داخل دالة القارئ)
        // ملاحظة: يجب تعديل الـ Selector (.reader-images img) حسب بنية الموقع المستهدف بدقة
        $('.reader-images img, .chapter-content img, #chapter-pages img').each((index, element) => {
            let imgUrl = $(element).attr('src') || $(element).attr('data-src');
            if (imgUrl) {
                // التأكد من أن الرابط كامل وليس نسبياً
                if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
                imageUrls.push(imgUrl);
            }
        });

        // 4. إرسال روابط الصور الحقيقية المستخلصة إلى موقعك
        res.json({
            success: true,
            total_pages: imageUrls.length,
            pages: imageUrls
        });

    } catch (error) {
        console.error("حدث خطأ أثناء الكشط:", error.message);
        res.status(505).json({ error: "فشل استخراج الصور من هذا الموقع، قد يكون محمياً ضد الكشط الآلي" });
    }
});

// تشغيل السيرفر على منفذ 3000
app.listen(3000, () => {
    console.log('سيرفر الكشط المطور يعمل الآن بنجاح على المنفذ 3000!');
});
