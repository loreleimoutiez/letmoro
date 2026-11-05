import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
// Rasterize the project's own square-and-underline mark without artwork tooling.
function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}
function chunk(type, bytes) {
  const tag = Buffer.from(type), size = Buffer.alloc(4), checksum = Buffer.alloc(4);
  size.writeUInt32BE(bytes.length); checksum.writeUInt32BE(crc32(Buffer.concat([tag, bytes])));
  return Buffer.concat([size, tag, bytes, checksum]);
}
for (const size of [192, 512]) {
  const rows = Buffer.alloc(size * (1 + size * 3), 255);
  for (let y = 0; y < size; y++) {
    rows[y * (1 + size * 3)] = 0;
    for (let x = 0; x < size; x++) {
      const square = x >= size / 4 && x < size * 3 / 4 && y >= size * 3 / 16 && y < size * 11 / 16;
      const underline = x >= size / 4 && x < size * 3 / 4 && y >= Math.floor(size * 3 / 4) && y < Math.floor(size * 3 / 4) + Math.max(1, size / 64);
      if (square || underline) rows.fill(0, y * (1 + size * 3) + 1 + x * 3, y * (1 + size * 3) + 4 + x * 3);
    }
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 2;
  writeFileSync(`public/icon-${size}.png`, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]));
}
