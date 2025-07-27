// ייבוא הספריות הנדרשות
const express = require('express');
const cors = require('cors');
const { HDate, HebrewCalendar } = require('@hebcal/core');

// יצירת אפליקציית Express
const app = express();

// הגדרת CORS לאפשר בקשות מכל מקור (לצורך פיתוח)
// ביישום אמיתי, מומלץ להגביל את המקורות המותרים
app.use(cors());

// הגדרת נקודת קצה לבדיקת תקינות השרת
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// נקודת קצה להמרת תאריך לועזי לתאריך עברי
// דוגמה לבקשה: /api/convert?year=2025&month=7&day=28
app.get('/api/convert', (req, res) => {
    const { year, month, day } = req.query;

    // בדיקת קלט
    if (!year || !month || !day) {
        return res.status(400).json({ error: 'שגיאה: יש לספק שנה, חודש ויום לועזיים.' });
    }

    try {
        const gy = parseInt(year);
        const gm = parseInt(month);
        const gd = parseInt(day);

        // יצירת אובייקט תאריך לועזי
        const hdate = new HDate(new Date(gy, gm - 1, gd)); // חודשים ב-Date הם 0-11

        // פורמט תאריך לועזי
        const gregorianFormatted = `${gd}/${gm}/${gy}`;

        // פורמט תאריך עברי (לדוגמה: "א׳ תשרי תשפ״ה")
        const hebrewFormatted = hdate.toString();

        res.json({
            gregorian: gregorianFormatted,
            hebrew: hebrewFormatted
        });
    } catch (error) {
        console.error('שגיאה בהמרת תאריך לועזי:', error);
        res.status(500).json({ error: 'שגיאה פנימית בשרת בהמרת תאריך לועזי.' });
    }
});

// נקודת קצה חדשה להמרת תאריך עברי לתאריך לועזי
// דוגמה לבקשה: /api/convert-hebrew?hyear=5785&hmonth=אב&hday=3
// הערה: יש להעביר את שם החודש העברי בעברית מלאה (לדוגמה: "תשרי", "אב", "ניסן")
app.get('/api/convert-hebrew', (req, res) => {
    const { hyear, hmonth, hday } = req.query;

    // בדיקת קלט
    if (!hyear || !hmonth || !hday) {
        return res.status(400).json({ error: 'שגיאה: יש לספק שנה, חודש ויום עבריים.' });
    }

    try {
        const hebrewYear = parseInt(hyear);
        const hebrewDay = parseInt(hday);

        // המרת שם החודש העברי למספר חודש פנימי של hebcal
        // יש לוודא שהשמות תואמים לאלו של hebcal/core
        const hebrewMonthMap = {
            'תשרי': 1, 'חשון': 2, 'מרחשון': 2, 'כסלו': 3, 'טבת': 4, 'שבט': 5,
            'אדר': 6, 'אדר א': 6, 'אדר ב': 7, 'ניסן': 8, 'אייר': 9, 'סיון': 10,
            'תמוז': 11, 'אב': 12, 'מנחם אב': 12, 'אלול': 13
        };
        const hebrewMonthNum = hebrewMonthMap[hmonth];

        if (!hebrewMonthNum) {
            return res.status(400).json({ error: 'שם חודש עברי לא חוקי. אנא השתמש בשם מלא (לדוגמה: "תשרי", "אב").' });
        }

        // יצירת אובייקט תאריך עברי
        const hd = new HDate(hebrewDay, hebrewMonthNum, hebrewYear);

        // המרה לתאריך לועזי
        const gregorianDate = hd.greg();

        // פורמט תאריך לועזי
        const gregorianFormatted = `${gregorianDate.getDate()}/${gregorianDate.getMonth() + 1}/${gregorianDate.getFullYear()}`;

        // פורמט תאריך עברי (לצורך אימות)
        const hebrewFormatted = hd.toString();

        res.json({
            hebrew: hebrewFormatted,
            gregorian: gregorianFormatted
        });
    } catch (error) {
        console.error('שגיאה בהמרת תאריך עברי:', error);
        res.status(500).json({ error: 'שגיאה פנימית בשרת בהמרת תאריך עברי.' });
    }
});


// הגדרת פורט השרת
const PORT = process.env.PORT || 3000;

// הפעלת השרת
app.listen(PORT, () => {
    console.log(`שרת פועל בפורט ${PORT}`);
});
