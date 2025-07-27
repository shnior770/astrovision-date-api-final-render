    // pages/api/health.js
    // זהו קובץ API פשוט לבדיקת תקינות השירות.
    // Vercel מזהה אוטומטית קבצים בתיקיית pages/api כ-Serverless Functions.

    export default async function handler(req, res) {
      // הגדרת כותרי CORS כדי לאפשר גישה מכל מקור (לצורך בדיקה).
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // טיפול בבקשות OPTIONS (נדרש עבור CORS preflight requests)
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      // בדיקה פשוטה שהשרת פועל
      res.status(200).json({ status: 'healthy', message: 'API is running' });
    }
    