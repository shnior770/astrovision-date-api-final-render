    // index.js
    // זהו קובץ ה-API הראשי, מותאם לפריסה כ-Web Service ב-Render.
    // הוא משתמש ב-Express.js כדי ליצור שרת HTTP שמקשיב לפורט.

    const express = require('express');
    const cors = require('cors');
    const fetch = require('node-fetch'); // נדרש עבור קריאות HTTP חיצוניות ב-Node.js

    const app = express();
    app.use(cors());
    app.use(express.json());

    // נקודת קצה לבדיקת תקינות השרת
    app.get('/api/health', (req, res) => {
        res.status(200).json({ status: 'healthy' });
    });

    // נקודת קצה להמרת תאריך לועזי לתאריך עברי באמצעות REST API של Hebcal.com
    // דוגמה לבקשה: /api/convert?year=2025&month=7&day=28
    app.get('/api/convert', async (req, res) => {
        const { year, month, day } = req.query;

        // בדיקת קלט
        if (!year || !month || !day) {
            return res.status(400).json({ error: 'שגיאה: יש לספק שנה, חודש ויום לועזיים.' });
        }

        try {
            // בניית ה-URL לקריאה ל-REST API של Hebcal.com
            const hebcalApiUrl = `https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`;

            // ביצוע הקריאה ל-REST API של Hebcal.com
            const response = await fetch(hebcalApiUrl);
            const data = await response.json();

            // בדיקה אם ה-API החיצוני החזיר שגיאה
            if (data.error) {
                console.error('Error from Hebcal API (Gregorian to Hebrew):', data.error);
                return res.status(500).json({ error: 'שגיאה בהמרת תאריך באמצעות שירות חיצוני.', details: data.error });
            }

            // החזרת הנתונים המומרים
            res.json({
                gregorian: `${day}/${month}/${year}`,
                hebrew: data.hebrew // Hebcal API מחזיר את התאריך העברי בשדה 'hebrew'
            });

        } catch (error) {
            console.error('שגיאה בהמרת תאריך לועזי לעברי (External API Call):', error);
            console.error('Stack Trace:', error.stack);
            res.status(500).json({ error: 'שגיאה פנימית בשרת בהמרת תאריך לועזי.', details: error.message });
        }
    });

    // נקודת קצה להמרת תאריך עברי לתאריך לועזי באמצעות REST API של Hebcal.com
    // דוגמה לבקשה: /api/convert-hebrew?hyear=5785&hmonth=אב&hday=3
    // הערה: יש להעביר את שם החודש העברי בעברית מלאה (לדוגמה: "תשרי", "אב", "ניסן")
    app.get('/api/convert-hebrew', async (req, res) => {
        const { hyear, hmonth, hday } = req.query;

        // בדיקת קלט
        if (!hyear || !hmonth || !hday) {
            return res.status(400).json({ error: 'שגיאה: יש לספק שנה, חודש ויום עבריים.' });
        }

        try {
            // בניית ה-URL לקריאה ל-REST API של Hebcal.com
            // שימו לב: hmonth צריך להיות שם החודש באנגלית (לדוגמה: "Av", "Tishrei")
            // נשתמש במפה כדי להמיר את השם העברי לאנגלית
            const hebrewMonthMapEnglish = {
                'תשרי': 'Tishrei', 'חשון': 'Cheshvan', 'מרחשון': 'Cheshvan', 'כסלו': 'Kislev', 'טבת': 'Tevet', 'שבט': 'Shvat',
                'אדר': 'Adar', 'אדר א': 'Adar I', 'אדר ב': 'Adar II', 'ניסן': 'Nisan', 'אייר': 'Iyyar', 'סיון': 'Sivan',
                'תמוז': 'Tammuz', 'אב': 'Av', 'מנחם אב': 'Av', 'אלול': 'Elul'
            };
            const englishMonthName = hebrewMonthMapEnglish[hmonth];

            if (!englishMonthName) {
                return res.status(400).json({ error: `שם חודש עברי לא חוקי: '${hmonth}'. אנא השתמש בשם מלא (לדוגמה: "תשרי", "אב").` });
            }

            const hebcalApiUrl = `https://www.hebcal.com/converter?cfg=json&hy=${hyear}&hm=${englishMonthName}&hd=${hday}&h2g=1`;

            // ביצוע הקריאה ל-REST API של Hebcal.com
            const response = await fetch(hebcalApiUrl);
            const data = await response.json();

            // בדיקה אם ה-API החיצוני החזיר שגיאה
            if (data.error) {
                console.error('Error from Hebcal API (Hebrew to Gregorian):', data.error);
                return res.status(500).json({ error: 'שגיאה בהמרת תאריך באמצעות שירות חיצוני.', details: data.error });
            }

            // החזרת הנתונים המומרים
            res.json({
                hebrew: data.hebrew, // Hebcal API מחזיר את התאריך העברי בשדה 'hebrew'
                gregorian: data.gregorian // Hebcal API מחזיר את התאריך הלועזי בשדה 'gregorian'
            });

        } catch (error) {
            console.error('שגיאה בהמרת תאריך עברי ללועזי (External API Call):', error);
            console.error('Stack Trace:', error.stack);
            res.status(500).json({ error: 'שגיאה פנימית בשרת בהמרת תאריך עברי.', details: error.message });
        }
    });

    // הגדרת פורט השרת
    const PORT = process.env.PORT || 3000;

    // הפעלת השרת
    app.listen(PORT, () => {
        console.log(`שרת פועל בפורט ${PORT}`);
    });
    
