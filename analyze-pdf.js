
const fs = require('fs');
const pdf = require('pdf-parse');

async function extractInfo() {
    const dataBuffer = fs.readFileSync('c:\\Temp\\alifa-institute-lms\\template KHS Mahasiswa.pdf');
    try {
        const data = await pdf(dataBuffer);
        console.log('--- PDF Text Content ---');
        console.log(data.text);
        console.log('--- Metadata ---');
        console.log(data.metadata);
        console.log('--- Info ---');
        console.log(data.info);
    } catch (err) {
        console.error('Error parsing PDF:', err);
    }
}

extractInfo();
