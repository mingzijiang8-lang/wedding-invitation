/** 全站统一的低饱和像素调色板（Morandi 色系），图片量化和地图绘制都用它 */
export const PALETTE = [
  '#f3efe6', // paper
  '#e9e3d6',
  '#d9d3c4',
  '#c9c2b3',
  '#b0a897',
  '#9a958a',
  '#7a766d',
  '#5c5952',
  '#3f3d38',
  '#2b2a27', // ink
  '#a08d80', // warm stone
  '#8a6f5c', // accent brown
  '#b89a93', // rose
  '#e5cbb6', // skin
  '#8e9b8a', // sage
  '#6f7d6c',
  '#9fb1b8', // mist blue
  '#7d8f99',
] as const

export type RGB = [number, number, number]

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const PALETTE_RGB: RGB[] = PALETTE.map(hexToRgb)

/** 感知加权的最近色查找 */
export function nearest(r: number, g: number, b: number): RGB {
  let best = PALETTE_RGB[0]
  let bestD = Infinity
  for (const c of PALETTE_RGB) {
    const dr = r - c[0]
    const dg = g - c[1]
    const db = b - c[2]
    const d = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11
    if (d < bestD) {
      bestD = d
      best = c
    }
  }
  return best
}
