import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../public')
mkdirSync(outDir, { recursive: true })

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n += 1) {
  let c = n
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c >>> 0
}

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuffer, data])
  const out = Buffer.alloc(body.length + 8)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc32(body), body.length + 4)
  return out
}

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function encodePng(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = pixel(x, y)
      const at = row + 1 + x * 4
      raw[at] = r
      raw[at + 1] = g
      raw[at + 2] = b
      raw[at + 3] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function coverage(distance, antialias) {
  return Math.max(0, Math.min(1, 0.5 - distance / antialias))
}

function makePixel(size) {
  const paper = [243, 237, 225]
  const cinnabar = [158, 59, 47]

  return (x, y) => {
    const u = x / size
    const v = y / size
    let color = [...cinnabar, 255]
    const paint = (rgb, alpha) => {
      if (alpha <= 0) return
      color = [
        color[0] + (rgb[0] - color[0]) * alpha,
        color[1] + (rgb[1] - color[1]) * alpha,
        color[2] + (rgb[2] - color[2]) * alpha,
        255,
      ]
    }
    const aa = 1.6 / size

    const border = Math.max(
      Math.abs(u - 0.5) - 0.5 + 0.085,
      Math.abs(v - 0.5) - 0.5 + 0.085,
    )
    paint(paper, coverage(Math.abs(border) - 0.0045, aa) * 0.4)

    const diamond = Math.abs(u - 0.5) + Math.abs(v - 0.5)
    paint(paper, coverage(Math.abs(diamond - 0.245) - 0.0065, aa) * 0.95)

    const waves = [
      { base: 0.44, phase: 0 },
      { base: 0.5, phase: 0.85 },
      { base: 0.56, phase: 1.7 },
    ]
    const inside = diamond < 0.205
    if (inside) {
      for (const wave of waves) {
        const line =
          wave.base + Math.sin((u * 1.35 + wave.phase) * Math.PI * 2) * 0.017
        const horizontal = Math.min(u - 0.295, 0.705 - u)
        if (horizontal <= 0) continue
        const d = Math.max(Math.abs(v - line) - 0.006, -horizontal)
        paint(paper, coverage(d, aa) * 0.92)
      }
    }

    const seal = Math.hypot(u - 0.5, v - 0.5)
    paint(paper, coverage(Math.abs(seal - 0.038) - 0.005, aa) * 0.85)

    return color.map((value) => Math.round(value))
  }
}

for (const size of [192, 512]) {
  writeFileSync(resolve(outDir, `icon-${size}.png`), encodePng(size, makePixel(size)))
}
console.log('PWA icons written to public/icon-192.png and public/icon-512.png')
