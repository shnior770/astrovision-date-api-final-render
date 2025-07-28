// index.js
// זהו קובץ ה-API הראשי, מותאם לפריסה כ-Web Service ב-Render.
// הוא משתמש ב-Express.js כדי ליצור שרת HTTP שמקשיב לפורט.

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // נדרש עבור קריאות HTTP חיצוניות ב-Node.js

const app = express();
const PORT = process.env.PORT || 10000; // Render provides PORT environment variable

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Endpoint to convert Gregorian date to Hebrew date using Hebcal.com REST API
// Example request: /api/convert?year=2025&month=7&day=28
app.get('/api/convert', async (req, res) => {
    const { year, month, day } = req.query;

    if (!year || !month || !day) {
        return res.status(400).json({ error: 'חובה לספק שנה לועזית (year), חודש לועזי (month) ויום לועזי (day).' });
    }

    try {
        // Build the URL for Hebcal.com REST API
        const hebcalApiUrl = `https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`;

        // Perform the HTTP request to Hebcal.com
        const response = await fetch(hebcalApiUrl);
        const data = await response.json();

        // Check if the external API returned an error
        if (data.error) {
            console.error('Error from Hebcal API (Gregorian to Hebrew):', data.error);
            return res.status(500).json({ error: 'שגיאה בהמרת תאריך באמצעות שירות חיצוני.', details: data.error });
        }

        // Return the converted data
        res.json({
            gregorian: `${day}/${month}/${year}`,
            hebrew: data.hebrew // Hebcal API returns the Hebrew date in the 'hebrew' field
        });

    } catch (error) {
        console.error('שגיאה בהמרת תאריך לועזי לעברי (External API Call):', error);
        console.error('Stack Trace:', error.stack);
        res.status(500).json({ error: 'שגיאה פנימית בשרת בעת המרת תאריך לועזי.', details: error.message });
    }
});

// Endpoint to convert Hebrew date to Gregorian date using Hebcal.com REST API
// Example request: /api/convert-hebrew?hyear=5785&hmonth=אב&hday=3
// Note: Hebrew month names must be converted to English as expected by Hebcal.com API
app.get('/api/convert-hebrew', async (req, res) => {
    const { hyear, hmonth, hday } = req.query;

    if (!hyear || !hmonth || !hday) {
        return res.status(400).json({ error: 'חובה לספק שנת יומן עברי (hyear), חודש עברי (hmonth) ויום עברי (hday).' });
    }

    try {
        // Map Hebrew month name to its English equivalent for Hebcal.com API
        const hebrewMonthMapEnglish = {
            'תשרי': 'Tishrei', 'חשון': 'Cheshvan', 'מרחשון': 'Cheshvan', 'כסלו': 'Kislev', 'טבת': 'Tevet', 'שבט': 'Shvat',
            'אדר': 'Adar', 'אדר א': 'Adar I', 'אדר ב': 'Adar II', 'ניסן': 'Nisan', 'אייר': 'Iyyar', 'סיון': 'Sivan',
            'תמוז': 'Tammuz', 'אב': 'Av', 'מנחם אב': 'Av', 'אלול': 'Elul'
        };
        const englishMonthName = hebrewMonthMapEnglish[hmonth];

        if (!englishMonthName) {
            return res.status(400).json({ error: `שם חודש עברי לא חוקי: '${hmonth}'. אנא וודא איות נכון (לדוגמה: "תשרי", "אב").` });
        }

        // Build the URL for Hebcal.com REST API
        const hebcalApiUrl = `https://www.hebcal.com/converter?cfg=json&hy=${hyear}&hm=${englishMonthName}&hd=${hday}&h2g=1`;

        // Perform the HTTP request to Hebcal.com
        const response = await fetch(hebcalApiUrl);
        const data = await response.json();

        // Check if the external API returned an error
        if (data.error) {
            console.error('Error from Hebcal API (Hebrew to Gregorian):', data.error);
            return res.status(500).json({ error: 'שגיאה בהמרת תאריך באמצעות שירות חיצוני.', details: data.error });
        }

        // Return the converted data
        res.json({
            hebrew: data.hebrew, // Hebcal API returns the Hebrew date in the 'hebrew' field
            gregorian: data.gregorian // Hebcal API returns the Gregorian date in the 'gregorian' field
        });

    } catch (error) {
        console.error('שגיאה כללית בהמרת תאריך עברי ללועזי (External API Call):', error);
        console.error('Stack Trace:', error.stack);
        res.status(500).json({ error: 'שגיאה פנימית בשרת בעת המרת תאריך עברי.', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`שרת פועל בפורט ${PORT}`);
});
