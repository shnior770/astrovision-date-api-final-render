    // pages/api/index.js
    // זהו קובץ ה-API הראשי להמרת תאריכים, מותאם לפריסה כ-Web Service ב-Render.
    // הוא משתמש ב-Express.js כדי ליצור שרת HTTP שמקשיב לפורט.

    import express from 'express';
    import { HebrewDate } from '@hebcal/core';
    import cors from 'cors'; // ייבוא ספריית CORS

    const app = express();
    const port = process.env.PORT || 3000; // Render מספק את הפורט דרך משתנה סביבה

    // שימוש ב-CORS כדי לאפשר בקשות מכל מקור
    app.use(cors());

    // שימוש ב-express.json לניתוח גוף בקשות JSON
    app.use(express.json());

    // נקודת קצה לבדיקת תקינות (Health Check)
    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'healthy', message: 'API is running' });
    });

    // נקודת קצה להמרת תאריכים (POST request)
    app.post('/api', (req, res) => {
      const { direction, year, month, day } = req.body;

      // ודא שכל הפרמטרים הנדרשים קיימים
      if (!direction || !year || !month || !day) {
        return res.status(400).json({ error: 'Bad Request', message: 'Missing required parameters: direction, year, month, or day.' });
      }

      let result;
      try {
        const y = parseInt(year);
        const m = parseInt(month);
        const d = parseInt(day);

        if (isNaN(y) || isNaN(m) || isNaN(d)) {
          return res.status(400).json({ error: 'Bad Request', message: 'Year, month, and day must be valid numbers.' });
        }

        if (direction === 'gregorian-to-hebrew') {
          const gd = new HebrewDate(y, m, d);
          result = {
            hebrewYear: gd.getFullYear(),
            hebrewMonth: gd.getMonthName(),
            hebrewDay: gd.getDate(),
            hebrewMonthNumber: gd.getMonth(),
            hebrewDayOfWeek: gd.getDayName(),
            gregorianDate: `${y}-${m}-${d}`
          };
        } else if (direction === 'hebrew-to-gregorian') {
          const hd = HebrewDate.create(y, m, d); // מניח ש-m הוא מספר חודש עברי
          if (!hd) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid Hebrew date provided.' });
          }
          const gregDate = hd.greg();
          result = {
            gregorianYear: gregDate.getFullYear(),
            gregorianMonth: gregDate.getMonth() + 1, // חודשים ב-JavaScript הם 0-11
            gregorianDay: gregDate.getDate(),
            hebrewDate: `${y}-${m}-${d}`
          };
        } else {
          return res.status(400).json({ error: 'Bad Request', message: 'Invalid direction. Must be "gregorian-to-hebrew" or "hebrew-to-gregorian".' });
        }

        res.status(200).json(result);
      } catch (error) {
        console.error('Error during date conversion:', error);
        res.status(500).json({ error: 'Server Error', message: 'An error occurred during date conversion.', details: error.message });
      }
    });

    // הפעלת השרת והאזנה לפורט
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
    