    // pages/api/index.js
    // זהו קובץ ה-API הראשי להמרת תאריכים.
    // Vercel מזהה אוטומטית קבצים בתיקיית pages/api כ-Serverless Functions.

    // ייבוא ספריית התאריכים העבריים
    // שימו לב: כאן נשתמש בייבוא דינמי כדי לטעון את הספריה רק כאשר הפונקציה נקראת.
    // זה עוזר לשמור על גודל קטן של הפונקציה ולטעון רק מה שצריך.
    let HebrewDate;

    export default async function handler(req, res) {
      // הגדרת כותרי CORS כדי לאפשר גישה מכל מקור (לצורך בדיקה).
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // טיפול בבקשות OPTIONS (נדרש עבור CORS preflight requests)
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      // ודא שהבקשה היא POST
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are supported.' });
      }

      // ודא שגוף הבקשה קיים
      if (!req.body) {
        return res.status(400).json({ error: 'Bad Request', message: 'Request body is missing.' });
      }

      const { direction, year, month, day } = req.body;

      // ודא שכל הפרמטרים הנדרשים קיימים
      if (!direction || !year || !month || !day) {
        return res.status(400).json({ error: 'Bad Request', message: 'Missing required parameters: direction, year, month, or day.' });
      }

      // טען את ספריית HebrewDate רק פעם אחת
      if (!HebrewDate) {
        try {
          // נסה לייבא את הספרייה מ-npm.
          // ב-Vercel, התלות הזו תותקן אוטומטית מ-package.json.
          const { HebrewDate: ImportedHebrewDate } = await import('@hebcal/core');
          HebrewDate = ImportedHebrewDate;
        } catch (e) {
          console.error('Failed to import @hebcal/core:', e);
          return res.status(500).json({ error: 'Server Error', message: 'Failed to load date conversion library.' });
        }
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
          // יש לוודא שהחודש העברי הוא מספר או שם חודש תקין
          // @hebcal/core מצפה למספר חודש עבור המרה מעברי ללועזי
          let hebrewMonthNum = m; // נניח ש-m הוא כבר מספר חודש
          // אם m הוא שם חודש, נצטרך למפות אותו למספר
          // לדוגמה: אם m הוא "Nisan", נצטרך למצוא את המספר 1
          // לצורך פשטות, נניח כרגע ש-m הוא מספר.
          // אם תצטרך תמיכה בשמות חודשים, נוכל להוסיף לוגיקה למיפוי.

          const hd = HebrewDate.create(y, hebrewMonthNum, d);
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
    }
    