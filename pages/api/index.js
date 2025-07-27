    // file: /opt/render/project/src/pages/api/index.js

    // ייבוא HebrewDate מהספרייה @hebcal/core (תיקון השם)
    import { HebrewDate } from '@hebcal/core';

    // ייבוא מודול Express ליצירת שרת אינטרנט
    const express = require('express');
    // ייבוא מודול CORS לטיפול בבקשות Cross-Origin
    const cors = require('cors');

    // יצירת מופע של אפליקציית Express
    const app = express();

    // הפעלת CORS לכל הבקשות
    app.use(cors());

    // הגדרת נקודת קצה (endpoint) עבור בקשות GET לנתיב '/api/hebrew-date'
    app.get('/api/hebrew-date', (req, res) => {
        try {
            // קבלת הפרמטרים 'day', 'month', 'year' מכתובת ה-URL של הבקשה
            const { day, month, year } = req.query;

            // בדיקה אם כל הפרמטרים הנדרשים קיימים
            if (!day || !month || !year) {
                // אם חסרים פרמטרים, שולח תגובת שגיאה 400 (Bad Request)
                return res.status(400).json({ error: 'חסרים פרמטרים: day, month, year' });
            }

            // המרת הפרמטרים למספרים שלמים
            const gDay = parseInt(day);
            const gMonth = parseInt(month);
            const gYear = parseInt(year);

            // בדיקה אם ההמרות הצליחו והערכים הם מספרים תקינים
            if (isNaN(gDay) || isNaN(gMonth) || isNaN(gYear)) {
                // אם הערכים אינם מספרים, שולח תגובת שגיאה 400
                return res.status(400).json({ error: 'פרמטרים day, month, year חייבים להיות מספרים תקינים' });
            }

            // יצירת אובייקט תאריך לועזי
            const gregDate = new Date(gYear, gMonth - 1, gDay); // חודשים ב-JavaScript הם מ-0 עד 11

            // יצירת אובייקט תאריך עברי מהתאריך הלועזי
            const hebrewDate = new HebrewDate(gregDate);

            // שליחת תגובת JSON עם התאריך העברי
            res.json({
                hebrewDate: {
                    day: hebrewDate.day,
                    month: hebrewDate.monthName, // שם החודש העברי
                    year: hebrewDate.year,
                    fullDate: hebrewDate.toString(), // ייצוג מלא של התאריך העברי
                },
                gregorianDate: {
                    day: gDay,
                    month: gMonth,
                    year: gYear,
                }
            });

        } catch (error) {
            // טיפול בשגיאות שעלולות לקרות במהלך התהליך
            console.error('שגיאה ב-API של התאריך העברי:', error);
            res.status(500).json({ error: 'שגיאה פנימית בשרת', details: error.message });
        }
    });

    // ייצוא האפליקציה של Express
    // זה חשוב כדי ש-Render יוכל להפעיל את השרת
    module.exports = app;
    
