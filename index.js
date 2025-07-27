    // index.js
    // זהו קובץ ה-API הראשי, מותאם לפריסה כ-Web Service ב-Render.
    // הוא משתמש ב-Express.js כדי ליצור שרת HTTP שמקשיב לפורט.

    const express = require('express');
    const cors = require('cors');
    // *** התיקון הקריטי כאן: ייבוא כל ספריית hebcal/core כאובייקט אחד ***
    const Hebcal = require('@hebcal/core');

    const app = express();
    app.use(cors());
    app.use(express.json()); // לטיפול בבקשות POST עם JSON body (אם נרצה להוסיף בעתיד)

    // נקודת קצה להמרת תאריך לועזי לתאריך עברי
    // דוגמה לבקשה: /api/convert?year=2025&month=7&day=28
    app.get('/api/convert', (req, res) => {
      try {
        // קבלת הפרמטרים 'year', 'month', 'day' מכתובת ה-URL של הבקשה
        const year = parseInt(req.query.year, 10);
        const month = parseInt(req.query.month, 10);
        const day = parseInt(req.query.day, 10);

        // בדיקה אם הפרמטרים קיימים והם מספרים תקינים
        if (isNaN(year) || isNaN(month) || isNaN(day) || !req.query.year || !req.query.month || !req.query.day) {
          return res.status(400).json({ error: 'Missing or invalid parameters: year, month, and day must be valid numbers.' });
        }

        // יצירת אובייקט Date סטנדרטי
        const standardDate = new Date(year, month - 1, day);

        // בדיקה אם התאריך שנוצר תקף
        if (isNaN(standardDate.getTime())) {
            return res.status(400).json({ error: 'Invalid Gregorian date provided.' });
        }

        // המרה לתאריך עברי באמצעות Hebcal.HDate
        const hdate = new Hebcal.HDate(standardDate);

        res.json({
          gregorian: `${day}/${month}/${year}`,
          hebrew: hdate.renderGematriya() // לדוגמה: "כח תמוז ה'תשפ"ה"
        });

      } catch (error) {
        // טיפול בשגיאות שעלולות לקרות במהלך התהליך
        console.error('Error in /api/convert (Gregorian to Hebrew):', error);
        console.error('Stack Trace:', error.stack); // הדפסת Stack Trace
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
      }
    });

    // נקודת קצה חדשה להמרת תאריך עברי לתאריך לועזי
    // דוגמה לבקשה: /api/convert-hebrew?hyear=5785&hmonth=אב&hday=3
    // הערה: יש להעביר את שם החודש העברי בעברית מלאה (לדוגמה: "תשרי", "אב", "ניסן")
    app.get('/api/convert-hebrew', (req, res) => {
        const { hyear, hmonth, hday } = req.query;

        // הוספת לוגים לדיבוג
        console.log(`[DEBUG] Received Hebrew to Gregorian request: hyear=${hyear}, hmonth=${hmonth}, hday=${hday}`);

        // בדיקת קלט
        if (!hyear || !hmonth || !hday) {
            console.error('[DEBUG] Missing parameters for Hebrew to Gregorian conversion.');
            return res.status(400).json({ error: 'שגיאה: יש לספק שנה, חודש ויום עבריים.' });
        }

        try {
            const hebrewYear = parseInt(hyear, 10);
            const hebrewDay = parseInt(hday, 10);

            // שימוש נכון בפונקציה getMonthFromName מהאובייקט הראשי Hebcal
            const hebrewMonthNum = Hebcal.getMonthFromName(hmonth);

            console.log(`[DEBUG] Parsed: hyear=${hebrewYear}, hday=${hebrewDay}, hmonthNum=${hebrewMonthNum}`);

            if (hebrewMonthNum === undefined) {
                console.error(`[DEBUG] Invalid Hebrew month name: '${hmonth}'.`);
                return res.status(400).json({ error: `שם חודש עברי לא חוקי: '${hmonth}'. אנא השתמש בשם מלא (לדוגמה: "תשרי", "אב").` });
            }

            // יצירת אובייקט תאריך עברי באמצעות Hebcal.HebrewDate.create
            const hd = Hebcal.HebrewDate.create(hebrewYear, hebrewMonthNum, hebrewDay);

            console.log(`[DEBUG] Created HDate object: ${hd}`);

            if (!hd) { // בדיקה אם התאריך העברי שנוצר אינו תקף
                console.error(`[DEBUG] Invalid Hebrew date created: ${hebrewYear}-${hebrewMonthNum}-${hebrewDay}`);
                return res.status(400).json({ error: 'תאריך עברי לא חוקי.' });
            }

            // המרה לתאריך לועזי
            const gregorianDate = hd.greg();

            console.log(`[DEBUG] Converted Gregorian Date: ${gregorianDate}`);

            // פורמט תאריך לועזי
            const gregorianFormatted = `${gregorianDate.getDate()}/${gregorianDate.getMonth() + 1}/${gregorianDate.getFullYear()}`;

            // פורמט תאריך עברי (לצורך אימות)
            const hebrewFormatted = hd.toString(); // אמור להחזיר בעברית

            res.json({
                hebrew: hebrewFormatted,
                gregorian: gregorianFormatted
            });
        } catch (error) {
            console.error('שגיאה בהמרת תאריך עברי (Hebrew to Gregorian):', error);
            console.error('Stack Trace:', error.stack); // הדפסת Stack Trace
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    });


    // נקודת קצה לבדיקת תקינות השרת
    app.get('/api/health', (req, res) => {
      res.json({ status: 'healthy' });
    });

    // הגדרת פורט השרת
    const PORT = process.env.PORT || 3000;

    // הפעלת השרת
    app.listen(PORT, () => {
        console.log(`שרת פועל בפורט ${PORT}`);
    });
    
