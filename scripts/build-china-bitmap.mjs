// 把中国及周边国家的边界 GeoJSON 栅格化成像素位图，输出 src/map/chinaBitmap.ts
//   '#' 中国   ','  周边国家（淡色示意）   '.' 海
// 用法：node scripts/build-china-bitmap.mjs china.json world.json
//   china.json：https://geo.datav.aliyun.com/areas_v3/bound/100000.json
//   world.json：https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const [chinaSrc, worldSrc] = process.argv.slice(2)
if (!chinaSrc || !worldSrc) {
  console.error('usage: node scripts/build-china-bitmap.mjs <china.geojson> <world.geojson>')
  process.exit(1)
}

const COLS = 112
// 经纬度范围：向东到 147° 以装下整个日本；南海诸岛不在主图内（另有小框示意）
const LNG0 = 73
const LNG1 = 147
const LAT0 = 17.5
const LAT1 = 54
const COS = Math.cos((36 * Math.PI) / 180)
const UNIT = ((LNG1 - LNG0) * COS) / COLS
const ROWS = Math.ceil((LAT1 - LAT0) / UNIT)

function polysOf(feature) {
  const g = feature.geometry
  return g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates]
}

const china = polysOf(JSON.parse(readFileSync(chinaSrc, 'utf8')).features[0])
const world = JSON.parse(readFileSync(worldSrc, 'utf8')).features
// 世界数据里的中国用 DataV 的精细版代替；台湾在 DataV 数据里已包含
const neighbors = world.filter((f) => !['CHN', 'TWN'].includes(f.id)).flatMap(polysOf)

function inRing(ring, x, y) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function inPolys(polys, lng, lat) {
  for (const poly of polys) {
    if (!inRing(poly[0], lng, lat)) continue
    let hole = false
    for (let k = 1; k < poly.length; k++) if (inRing(poly[k], lng, lat)) hole = true
    if (!hole) return true
  }
  return false
}

function sample(polys, lng, lat) {
  // 每格采样 4 个点，任一点在陆地上就算陆地，避免细长海岸线断掉
  const d = UNIT / COS / 4
  return (
    inPolys(polys, lng, lat) ||
    inPolys(polys, lng - d, lat) ||
    inPolys(polys, lng + d, lat) ||
    inPolys(polys, lng, lat + UNIT / 4)
  )
}

const rows = []
for (let r = 0; r < ROWS; r++) {
  let line = ''
  for (let c = 0; c < COLS; c++) {
    const lng = LNG0 + ((c + 0.5) * UNIT) / COS
    const lat = LAT1 - (r + 0.5) * UNIT
    line += sample(china, lng, lat) ? '#' : sample(neighbors, lng, lat) ? ',' : '.'
  }
  rows.push(line)
}

const out = `// 由 scripts/build-china-bitmap.mjs 生成，勿手改
export const CHINA_COLS = ${COLS}
export const CHINA_ROWS = ${ROWS}
export const CHINA_PROJ = { lng0: ${LNG0}, lat1: ${LAT1}, cos: ${COS.toFixed(6)}, unit: ${UNIT.toFixed(6)} }

/** 经纬度 → 格子坐标（可为小数） */
export function project(lng: number, lat: number) {
  return {
    x: ((lng - CHINA_PROJ.lng0) * CHINA_PROJ.cos) / CHINA_PROJ.unit,
    y: (CHINA_PROJ.lat1 - lat) / CHINA_PROJ.unit,
  }
}

/** '#' 中国  ',' 周边国家  '.' 海 */
export const CHINA_BITMAP: string[] = [
${rows.map((r) => `  '${r}',`).join('\n')}
]
`
mkdirSync('src/map', { recursive: true })
writeFileSync('src/map/chinaBitmap.ts', out)
console.log(`wrote src/map/chinaBitmap.ts (${COLS}x${ROWS})`)
console.log(rows.join('\n'))
