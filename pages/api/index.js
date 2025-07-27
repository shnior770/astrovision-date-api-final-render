// file: /opt/render/project/src/pages/api/index.js

// ייבוא פונקציות הנדרשות מהספרייה @hebcal/hebcal-js
import { HDate, Locale } from '@hebcal/hebcal-js';

// הגדרת פונקציית ה-handler עבור בקשות HTTP
export default async function handler(req, res) {
  // הגדרת כותרות CORS כדי לאפשר גישה מכל מקור (לצורך בדיקה ופיתוח)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // טיפול בבקשות OPTIONS (נדרש עבור בקשות Preflight של CORS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // בדיקה ששיטת הבקשה היא GET
  if (req.method !== 'GET') {
    // אם לא GET, מחזירים שגיאה 405 (Method Not Allowed)
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // יצירת אובייקט תאריך עברי עבור התאריך הנוכחי
    const today = new HDate();

    // קבלת התאריך העברי בפורמט מילולי (לדוגמה: "כח תמוז ה'תשפ"ה")
    // Locale.get="" משתמש בברירת המחדל של Hebcal (עברית)
    const hebrewDate = today.toString();

    // החזרת התאריך העברי כתגובת JSON
    res.status(200).json({ hebrewDate });
  } catch (error) {
    // טיפול בשגיאות שעלולות לקרות במהלך יצירת התאריך
    console.error('Error generating Hebrew date:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
