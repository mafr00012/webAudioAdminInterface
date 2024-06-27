const QRCode = require('qrcode');

const url = 'https://www.example.com';
const outputFile = 'qrcode.png';

QRCode.toDataURL(url, function (err, qrUrl) {
  if (err) {
    console.error('Error generating QR code:', err);
    return;
  }
  console.log('QR Code URL:', qrUrl);
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR Code</title>
      </head>
      <body>
        <h1>Scan the QR Code to visit the website</h1>
        <img src="${qrUrl}" alt="QR Code">
      </body>
    </html>
  `;
  // Save HTML to a file or serve it via a web server
  require('fs').writeFileSync('qrcode.html', html);
});

QRCode.toFile(outputFile, url, function (err) {
  if (err) {
    console.error('Error generating QR code:', err);
    return;
  }
  console.log(`QR Code saved to ${outputFile}`);
});
