
const fs = require('fs');
const pdf = require('pdf-parse');

async function extract() {
    try {
        const buffer = fs.readFileSync('c:\\Temp\\alifa-institute-lms\\template KHS Mahasiswa.pdf');
        const data = await pdf(buffer);
        console.log(data.text);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
extract();
