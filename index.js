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
        const { year, month, day } = req.query;

        if (!year || !month || !day) {
          return res.status(400).json({ error: 'Missing parameters: year, month, day' });
        }

        const gYear = parseInt(year);
        const gMonth = parseInt(month);
        const gDay = parseInt(day);

        if (isNaN(gYear) || isNaN(gMonth) || isNaN(gDay)) {
          return res.status(400).json({ error: 'Invalid parameters: year, month, day must be numbers' });
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
    
