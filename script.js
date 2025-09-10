const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const csv = require('csv-parser');

// === CONFIG ===
const csvFilePath = path.join(__dirname, 'parts.csv'); 
const domain = 'store.waldoch.com/products'; // Shopify product path
const saveDir = path.join(__dirname, 'images');

if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir);

// === Helper: Get latest snapshot from Wayback Machine ===
async function getLatestSnapshot(url) {
    const apiUrl = `http://web.archive.org/cdx/search/cdx?url=${url}&output=json&limit=1&filter=statuscode:200&collapse=digest`;
    try {
        const res = await axios.get(apiUrl);
        if (res.data && res.data.length > 1) {
            return res.data[1][1]; // timestamp
        }
    } catch (err) {
        console.error(`Error fetching snapshot for ${url}:`, err.message);
    }
    return null;
}

// === Helper: Download image ===
async function downloadImage(url, filename) {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(path.join(saveDir, filename), res.data);
        console.log(`Saved: ${filename}`);
    } catch (err) {
        console.error(`Error downloading ${url}:`, err.message);
    }
}

// === Main function: Process part numbers ===
async function fetchImages(partNumbers) {
    for (const part of partNumbers) {
        const productUrl = `https://${domain}/${part}`;
        const timestamp = await getLatestSnapshot(productUrl);
        if (!timestamp) {
            console.log(`No snapshot found for ${productUrl}`);
            continue;
        }

        const archiveUrl = `https://web.archive.org/web/${timestamp}/${productUrl}`;
        try {
            const res = await axios.get(archiveUrl);
            const $ = cheerio.load(res.data);

            $('img').each(async (i, img) => {
                let imgUrl = $(img).attr('src');
                if (!imgUrl) return;

                // Make absolute if needed
                if (imgUrl.startsWith('/')) {
                    imgUrl = `https://web.archive.org${imgUrl}`;
                } else if (!imgUrl.startsWith('http')) {
                    imgUrl = `https://web.archive.org/web/${timestamp}/${imgUrl}`;
                }

                const filename = `${part}_${path.basename(imgUrl.split('?')[0])}`;
                await downloadImage(imgUrl, filename);
            });
        } catch (err) {
            console.error(`Error fetching archived page for ${part}:`, err.message);
        }
    }
}

// === Read CSV and start ===
const partNumbers = [];
fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
        // Shopify CSV column header might be 'Handle' or 'Part Number'
        const part = row['A'] || row['Handle'] || row['Part Number'];
        if (part) partNumbers.push(part.trim());
    })
    .on('end', () => {
        console.log(`Found ${partNumbers.length} part numbers. Starting download...`);
        fetchImages(partNumbers);
    });
