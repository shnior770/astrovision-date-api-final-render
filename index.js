const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Using node-fetch for server-side HTTP requests
const Hebcal = require('hebcal'); // Assuming hebcal library is installed

const app = express();
const PORT = process.env.PORT || 10000; // Render provides PORT environment variable

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing

// Mapping Hebrew month names to Hebcal's numerical representation
// Note: Hebcal.Month enum values are 1 for Tishrei, 2 for Cheshvan, ..., 13 for Elul
const hebrewMonthNames = {
    "תשרי": 1, "חשון": 2, "כסלו": 3, "טבת": 4, "שבט": 5, "אדר": 6, "אדר א": 6, "אדר ב": 7,
    "ניסן": 8, "אייר": 9, "סיון": 10, "תמוז": 11, "אב": 12, "אלול": 13
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Endpoint to convert Gregorian date to Hebrew date
app.get('/api/convert', async (req, res) => {
    try {
        const { year, month, day } = req.query;

        if (!year || !month || !day) {
            return res.status(400).json({ error: 'חובה לספק שנה לועזית (year), חודש לועזי (month) ויום לועזי (day).' });
        }

        const gYear = parseInt(year);
        const gMonth = parseInt(month);
        const gDay = parseInt(day);

        // Validate date components
        if (isNaN(gYear) || isNaN(gMonth) || isNaN(gDay)) {
            return res.status(400).json({ error: 'שנה, חודש או יום לא חוקיים. אנא ספק מספרים.' });
        }

        // Create a Date object for the Gregorian date
        const gregorianDate = new Date(gYear, gMonth - 1, gDay); // Month is 0-indexed in Date object

        // Convert Gregorian date to Hebrew date using Hebcal
        const hebrewDate = new Hebcal.HDate(gregorianDate);

        // Format the Gregorian date string
        const formattedGregorian = `${gDay}/${gMonth}/${gYear}`;

        // Get Hebrew date string from Hebcal
        const formattedHebrew = hebrewDate.toString();

        res.json({
            gregorian: formattedGregorian,
            hebrew: formattedHebrew
        });
    } catch (error) {
        console.error('שגיאה בהמרת תאריך לועזי לעברי:', error);
        res.status(500).json({ error: 'אירעה שגיאה בשרת בעת המרת תאריך לועזי לעברי.' });
    }
});

// Endpoint to convert Hebrew date to Gregorian date
app.get('/api/convert-hebrew', async (req, res) => {
    try {
        const { hyear, hmonth, hday } = req.query;

        console.log(`[DEBUG] Received Hebrew date query: hyear=${hyear}, hmonth=${hmonth}, hday=${hday}`);

        if (!hyear || !hmonth || !hday) {
            return res.status(400).json({ error: 'חובה לספק שנת יומן עברי (hyear), חודש עברי (hmonth) ויום עברי (hday).' });
        }

        const parsedHYear = parseInt(hyear);
        const parsedHDay = parseInt(hday);

        if (isNaN(parsedHYear) || isNaN(parsedHDay)) {
            return res.status(400).json({ error: 'שנה עברית או יום עברי לא חוקיים. אנא ספק מספרים.' });
        }

        // Convert Hebrew month name to its numerical representation
        const hebMonthNum = hebrewMonthNames[hmonth];
        console.log(`[DEBUG] Converted Hebrew month name "${hmonth}" to number: ${hebMonthNum}`);

        if (hebMonthNum === undefined) {
            return res.status(400).json({ error: 'שם חודש עברי לא חוקי. אנא וודא איות נכון (לדוגמה: "אדר א", "אדר ב").' });
        }

        let hebrewDate;
        try {
            hebrewDate = new Hebcal.HDate(parsedHDay, hebMonthNum, parsedHYear);
            console.log(`[DEBUG] Created Hebcal.HDate object: ${hebrewDate.toString()}`);
        } catch (hdateError) {
            console.error(`[DEBUG] Error creating Hebcal.HDate: ${hdateError.message}`);
            return res.status(400).json({ error: `שגיאה ביצירת תאריך עברי: ${hdateError.message}` });
        }

        const gregorianDate = hebrewDate.greg(); // This should return a Date object
        console.log(`[DEBUG] Gregorian Date object from greg(): ${gregorianDate}`);

        let formattedGregorian = null;
        if (gregorianDate instanceof Date && !isNaN(gregorianDate)) { // Check if it's a valid Date object
            const gregYear = gregorianDate.getFullYear();
            const gregMonth = gregorianDate.getMonth() + 1; // Month is 0-indexed
            const gregDay = gregorianDate.getDate();
            formattedGregorian = `${gregDay}/${gregMonth}/${gregYear}`;
            console.log(`[DEBUG] Formatted Gregorian date: ${formattedGregorian}`);
        } else {
            console.warn(`[DEBUG] greg() did not return a valid Date object for Hebrew date: ${hday} ${hmonth} ${hyear}`);
        }

        // Get Hebrew date string from Hebcal for consistency
        const formattedHebrew = hebrewDate.toString();
        console.log(`[DEBUG] Formatted Hebrew date: ${formattedHebrew}`);

        res.json({
            hebrew: formattedHebrew,
            gregorian: formattedGregorian // Will be null if conversion failed
        });
    } catch (error) {
        console.error('שגיאה כללית בהמרת תאריך עברי ללועזי:', error);
        res.status(500).json({ error: 'אירעה שגיאה בשרת בעת המרת תאריך עברי ללועזי.' });
    }
});

app.listen(PORT, () => {
    console.log(`שרת פועל בפורט ${PORT}`);
});
