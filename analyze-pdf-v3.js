
const fs = require('fs');
const pdf = require('pdf-parse');

async function extract() {
    try {
        const buffer = fs.readFileSync('c:\\Temp\\alifa-institute-lms\\template KHS Mahasiswa.pdf');
        // Some versions of pdf-parse export the function directly, some as a property
        const parse = typeof pdf === 'function' ? pdf : pdf.default || pdf;
        const data = await parse(buffer);
        console.log('--- CONTENT START ---');
        console.log(data.text);
        console.log('--- CONTENT END ---');
    } catch (e) {
        console.log('Error:', e.message);
    }
}
extract();
