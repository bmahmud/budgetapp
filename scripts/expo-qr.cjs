/**
 * Writes a PNG QR code for an Expo dev connection URL.
 * Expo Go expects the string shown under the terminal QR (exp://... or https://expo.dev/...).
 */
const path = require("path");
const QRCode = require("qrcode");

const url = process.argv[2];
const outArg = process.argv[3];
const outPath = path.resolve(process.cwd(), outArg || "expo-connect-qr.png");

if (!url) {
  console.error(
    "Usage: npm run expo-qr -- \"<connection-url>\" [output.png]\n\n" +
      "Copy the connection URL from:\n" +
      "  • The Expo CLI (under the QR block), or\n" +
      "  • Expo Dev Tools in the browser (Connection tab).\n\n" +
      "Example:\n" +
      '  npm run expo-qr -- "exp://192.168.1.10:8081"',
  );
  process.exit(1);
}

QRCode.toFile(outPath, url, { width: 512, margin: 2 })
  .then(() => {
    console.log("Wrote", outPath);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
