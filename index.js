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
        // וודא שהם מומרים למספרים שלמים בבטחה
        const gYear = parseInt(req.query.year, 10); // הבסיס 10 מבטיח המרה עשרונית
        const gMonth = parseInt(req.query.month, 10);
        const gDay = parseInt(req.query.day, 10);

        // בדיקה אם הפרמטרים הם מספרים תקינים
        if (isNaN(gYear) || isNaN(gMonth) || isNaN(gDay)) {
          return res.status(400).json({ error: 'Invalid parameters: year, month, and day must be valid numbers.' });
        }

        // בדיקה שהפרמטרים קיימים (למרות ש-parseInt יחזיר NaN אם לא קיימים, זה מוסיף בהירות)
        if (!req.query.year || !req.query.month || !req.query.day) {
            return res.status(400).json({ error: 'Missing required parameters: year, month, or day.' });
        }

        // יצירת תאריך לועזי באמצעות GregorianDate
        const gregDate = new GregorianDate(gYear, gMonth, gDay);
        // המרה לתאריך עברי באמצעות HDate
        const hdate = new HDate(gregDate);

        res.json({
          gregorian: `${gDay}/${gMonth}/${gYear}`,
          hebrew: hdate.renderGematriya() // לדוגמה: "כח תמוז ה'תשפ"ה"
        });

      } catch (error) {
        // טיפול בשגיאות שעלולות לקרות במהלך התהליך
        console.error('Error in /api/convert:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
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
    
