    // index.js
    // זהו קובץ ה-API הראשי, מותאם לפריסה כ-Web Service ב-Render.
    // הוא משתמש ב-Express.js כדי ליצור שרת HTTP שמקשיב לפורט.

    const express = require('express');
    const cors = require('cors');
    // ייבוא ישיר של המחלקות HDate ו-GregorianDate מהספרייה @hebcal/core
    const { HDate, GregorianDate } = require('@hebcal/core');

    const app = express();
    app.use(cors());
    app.use(express.json()); // לטיפול בבקשות POST עם JSON body (אם נרצה להוסיף בעתיד)

    // נקודת קצה להמרת תאריכים (GET request)
    // דוגמה לשימוש: /api/convert?year=2024&month=7&day=28
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

        // *** שינוי כאן: יצירת אובייקט Date סטנדרטי תחילה ***
        // חודשים ב-JavaScript הם 0-11, לכן מפחיתים 1 מהחודש הלועזי
        const standardDate = new Date(year, month - 1, day);

        // בדיקה אם התאריך שנוצר תקף (לדוגמה, 30 בפברואר לא יהיה תקף)
        if (isNaN(standardDate.getTime())) {
            return res.status(400).json({ error: 'Invalid Gregorian date provided.' });
        }

        // המרה לתאריך עברי באמצעות HDate, המקבלת אובייקט Date סטנדרטי
        const hdate = new HDate(standardDate);

        res.json({
          gregorian: `${day}/${month}/${year}`,
          hebrew: hdate.renderGematriya() // לדוגמה: "כח תמוז ה'תשפ"ה"
        });

      } catch (error) {
        // טיפול בשגיאות שעלולות לקרות במהלך התהליך
        console.error('Error in /api/convert:', error); // ודא שזה מודפס ללוגים
        res.status(500).json({ error: 'Internal Server Error', message: error.message }); // החזרת הודעת השגיאה ב-API
      }
    });

    // נקודת קצה לבדיקת תקינות (Health Check)
    app.get('/api/health', (req, res) => {
      res.json({ status: 'healthy' });
    });

    // הגדרת הפורט שהשרת יאזין לו
    // Render מספק את הפורט דרך משתנה הסביבה PORT
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    
