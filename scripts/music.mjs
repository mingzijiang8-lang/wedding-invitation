// 背景音乐工具（曲目来自 incompetech.com，Kevin MacLeod，CC BY 4.0）
//   node scripts/music.mjs preview           把 /tmp/music/*.mp3 剪成 40 秒试听，生成 public/_music/ 试听页（不入库）
//   node scripts/music.mjs use "In Your Arms"  把整曲做响度归一、淡入淡出、压到 96kbps，写成 public/music.mp3
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'

const SRC = '/tmp/music'
const [cmd, arg] = process.argv.slice(2)

const notes = {
  'In Your Arms': '1940 年代的慢板爵士，最贴报纸的年代感，浪漫但不腻',
  'Night in Venice': '做旧处理过的老唱片爵士，像从收音机里飘出来',
  'Cool Vibes': '慢速爵士三重奏，钢琴 + 贝斯 + 鼓，安静高级',
  'Backbay Lounge': '晚宴上的气泡酒感，轻奢 lounge',
  'Eternity': '作者自称"最高级、最不打扰人"的背景乐',
  'Bossa Antigua': '巴萨诺瓦，海边、花园、轻松自然',
  'Lobby Time': '复古酒店大堂的 lounge 爵士，带点俏皮',
  'Airport Lounge': '轻盈通透，完全不抢戏',
  'Jazz Brunch': '有点太讲究的咖啡馆里的早午餐爵士',
  'Gymnopedie No 1': '萨蒂《裸体歌舞》第一号，优雅、略带一点暗，最经典',
  'Water Lily': '简洁优雅的小品',
  'Dreamer': '丰满的钢琴和弦配轻打击，电影感',
  'Avec Soin': '很松的慢板钢琴，结尾安静',
  'Autumn Day': '钢琴 + 吉他 + 弦乐，温和舒适',
  'Almost Bliss': '湖边柠檬水的午后，明亮舒缓',
  'Sincerely': '慢慢聊过去和未来的那种钢琴',
  'Fretless': '流畅顺滑的轻爵士，谁都不会讨厌',
  'Wallpaper': '干净的原声吉他小调',
  'Heartwarming': '温暖明亮的钢琴，偏浪漫喜剧',
  'Wholesome': '全原声乐器，朴实温暖',
  'Backed Vibes Clean': '冷静的电颤琴背景爵士',
  'Odyssey': '电子味的明亮循环，偏太空感',
  'Carefree': '尤克里里，很欢快（可能太"vlog"）',
  'Life of Riley': '中速欢快（也偏 vlog）',
}

const titleOf = (file) => decodeURIComponent(basename(file, '.mp3')).replace(/\.$/, '')

if (cmd === 'preview') {
  const out = 'public/_music'
  mkdirSync(out, { recursive: true })
  const files = readdirSync(SRC).filter((f) => f.endsWith('.mp3'))
  const items = []
  for (const f of files) {
    const title = titleOf(f)
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const dst = join(out, `${slug}.mp3`)
    if (!existsSync(dst)) {
      // 从 20 秒处截 40 秒，前后各 1.5 秒淡入淡出，响度拉平方便比较
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '20', '-t', '40', '-i', join(SRC, f),
        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=1.5,afade=t=out:st=38.5:d=1.5',
        '-b:a', '80k', dst])
    }
    items.push({ title, slug, note: notes[title] ?? '' })
    process.stdout.write('.')
  }
  const order = Object.keys(notes)
  items.sort((a, b) => (order.indexOf(a.title) + 1 || 99) - (order.indexOf(b.title) + 1 || 99))
  writeFileSync(join(out, 'index.html'), page(items))
  console.log(`\n试听页：http://localhost:5180/_music/index.html  （${items.length} 首）`)
} else if (cmd === 'use' && arg) {
  const f = readdirSync(SRC).find((x) => titleOf(x).toLowerCase() === arg.toLowerCase())
  if (!f) throw new Error(`没找到 ${arg}，可选：${readdirSync(SRC).map(titleOf).join('、')}`)
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(SRC, f),
    '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-18:TP=-1.5:LRA=11,afade=t=in:d=2',
    '-b:a', '96k', '-ac', '2', 'public/music.mp3'])
  const size = (execFileSync('stat', ['-f%z', 'public/music.mp3']).toString().trim() / 1024 / 1024).toFixed(2)
  console.log(`public/music.mp3 ← ${titleOf(f)}  (${size} MB)`)
} else {
  console.log('用法：node scripts/music.mjs preview | use "曲名"')
}

function page(items) {
  return `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>背景音乐试听</title>
<style>
  body{margin:0;background:#f3efe6;color:#2b2a27;font:15px/1.6 -apple-system,"PingFang SC",serif;padding:20px 16px 60px}
  h1{font-size:18px;letter-spacing:.2em;margin:0 0 4px}
  p.tip{font-size:12px;color:#8a8478;margin:0 0 18px}
  .item{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1px solid #d8d2c4}
  .item.playing{background:#ebe5d6;margin:0 -16px;padding:12px 16px}
  button{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid #2b2a27;background:#fff;font-size:16px}
  .t{font-weight:600}.n{font-size:12px;color:#6b665c}
  .bar{height:2px;background:#d8d2c4;margin-top:8px;position:relative}.bar i{position:absolute;left:0;top:0;bottom:0;background:#2b2a27;width:0}
</style></head><body>
<h1>背景音乐试听</h1>
<p class="tip">每首截了中间 40 秒。定了哪首，告诉我曲名就行。</p>
${items.map((x) => `<div class="item" data-src="${x.slug}.mp3"><button aria-label="播放">▶</button><div style="flex:1"><div class="t">${x.title}</div><div class="n">${x.note}</div><div class="bar"><i></i></div></div></div>`).join('\n')}
<audio id="a"></audio>
<script>
const a=document.getElementById('a');let cur=null;
document.querySelectorAll('.item').forEach(el=>{el.querySelector('button').onclick=()=>{
  if(cur===el&&!a.paused){a.pause();el.querySelector('button').textContent='▶';el.classList.remove('playing');return}
  if(cur){cur.classList.remove('playing');cur.querySelector('button').textContent='▶';cur.querySelector('.bar i').style.width='0'}
  cur=el;a.src=el.dataset.src;a.play();el.classList.add('playing');el.querySelector('button').textContent='❚❚';
}});
a.ontimeupdate=()=>{if(cur)cur.querySelector('.bar i').style.width=(a.currentTime/(a.duration||40)*100)+'%'};
a.onended=()=>{if(cur){cur.classList.remove('playing');cur.querySelector('button').textContent='▶'}};
</script></body></html>`
}
