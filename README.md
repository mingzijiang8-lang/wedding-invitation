# 晨间号外 · 结婚请帖

一份"能走进去的报纸"：竖版报纸排版 + 低饱和像素画 + 一张像素中国地图，新郎新娘会沿着你们去过的城市一路走到婚礼现场。纯静态站点，没有后端，适合直接丢到任何静态托管上然后在微信里分享。

新郎新娘的像素形象沿用了 `wedding-lottery` 抽奖项目里的精灵图（`public/sprites/`），两个项目风格一致。

预览：`npm install && npm run dev`，手机扫二维码或在浏览器里切到手机尺寸打开。

## 目录

```
src/
  content.ts            ← 所有文案、日期、地点、照片路径都在这里改
  App.tsx               ← 页面顺序
  components/
    Cover.tsx           封面（点击翻开，触发音乐）
    Masthead.tsx        报头 + 倒计时
    FrontPage.tsx       头版：标题、像素婚纱照
    Interview.tsx       第二版：专访问答
    JourneyMap.tsx      第三版：像素中国地图 + 城市足迹（Canvas）
    Guide.tsx           第四版：赴宴指南（复制地址 / 高德 / 腾讯地图 / 加日历）
    Closing.tsx         末版：编后语 + 回复引导 + 限量编号
  pixel/
    palette.ts          全站像素调色板
    PixelImage.tsx      运行时把照片量化成像素画，可点击看原图
    characters.ts       新郎新娘精灵帧的加载与 canvas 绘制
    Character.tsx       页面里显示角色的组件（站立 / 举手 / 行走）
  map/
    chinaBitmap.ts      中国轮廓像素位图（脚本生成）
    cities.ts           常用城市经纬度表
public/
  sprites/              新郎新娘精灵图（来自 wedding-lottery）
  photos/               照片放这里，content.ts 里引用
  music.mp3             背景音乐（自备，没有则自动隐藏播放按钮）
  share.jpg             微信分享缩略图（自备，建议 300×300 正方形）
```

## 上线前要做的事

1. **改文案**：编辑 `src/content.ts`，姓名、日期、地点、专访问答、地图五个站点的文字都在里面。
2. **换照片**：把照片放进 `public/photos/`，在 `content.ts` 里填 `frontPage.photo`、`interview.photos` 和各城市的 `photos`。任何 jpg/png 都可以，建议原图先压到 1200px 宽以内。没填路径的位置会显示两位像素当事人的占位合影。
   照片默认先显示像素化版本、点一下看原图；不喜欢可以在 `photoStyle` 里把 `pixelate` 改成 `false` 直接显示原图，或者调大 `colsLarge` / `colsSmall` 让像素更细。
3. **城市足迹**：`journey.cities` 是一个按时间顺序排列的数组，最后一站放婚礼所在的城市。每个城市这样写：

   ```ts
   {
     name: '成都',                 // 在 src/map/cities.ts 里有坐标的城市不用填经纬度
     date: '二〇一九年十月',
     title: '第一次一起旅行',
     text: '排了两个小时的火锅……',
     photos: ['/photos/cd-1.jpg', '/photos/cd-2.jpg'],   // 可选，可以放多张
     label: 'left',               // 可选，城市名画在地标的哪一侧（left/right/top/bottom），用来避开重叠
   }
   ```

   同一个城市可以出现多次。`cities.ts` 里没有的城市，加上 `lng`、`lat` 两个字段即可（WGS84 坐标，精确到城区就行）。地图范围是东经 73°～147°、北纬 17.5°～54°，覆盖全国以及日本、朝鲜半岛、蒙古、中南半岛北部，出了这个范围的城市不会显示。城市越多两人走完全程的时间越长，目前每段路大约 2～5 秒。
4. **高德坐标**：在 [高德坐标拾取器](https://lbs.amap.com/tools/picker) 搜酒店名，把经纬度填到 `wedding.lng` / `wedding.lat`。
5. **背景音乐**：放一个 `public/music.mp3`，注意版权，建议 2MB 以内。
6. **分享缩略图**：放一个 `public/share.jpg`。微信会读取 `index.html` 里的 `<title>` 和 `<meta name="description">` 作为卡片标题和描述，缩略图默认抓页面第一张够大的图，`index.html` 里已经放了一个隐藏的 `<img src="/share.jpg">` 引导它。
7. **字体（可选）**：目前用系统衬线字体（iOS 上是宋体，安卓会退化为黑体）。想统一效果可以用 [cn-font-split](https://github.com/KonghaYao/cn-font-split) 给"思源宋体"做子集化，放到 `public/fonts/`，在 `src/index.css` 里加 `@font-face` 并把 `--font-serif` 指过去。

## 部署

```bash
npm run build   # 产物在 dist/
```

把 `dist/` 整个目录上传即可。可选：

- **Cloudflare Pages / Vercel**：连 GitHub 仓库自动部署，免费，国内可访问但偶尔慢。
- **腾讯云静态网站托管 / 阿里云 OSS**：国内访问最稳，需要一个已备案的域名。

微信里首次打开外链可能提示"非微信官方网页"，属正常现象，点"继续访问"即可。用自己的备案域名会减少这种提示。

## 重新生成中国轮廓（一般不需要）

`src/map/chinaBitmap.ts` 是把阿里云 DataV 的中国国界（精细）和 johan/world.geo.json 的周边国家（粗略、画成淡色）栅格化出来的 112×69 位图。想换分辨率或范围时改 `scripts/build-china-bitmap.mjs` 里的常量后重跑：

```bash
curl -sL -o /tmp/china.json "https://geo.datav.aliyun.com/areas_v3/bound/100000.json"
curl -sL -o /tmp/world.json "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
node scripts/build-china-bitmap.mjs /tmp/china.json /tmp/world.json
```

## 本地截图检查

`scripts/shot.mjs` 会用本机 Chrome 以 iPhone 尺寸打开页面并逐屏截图到 `shots/`，方便改完文案后快速过一遍：

```bash
npm run dev -- --port 5180
node scripts/shot.mjs
```

## 技术栈

Vite · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion。像素图和地图都是原生 Canvas，没有引入游戏引擎。
