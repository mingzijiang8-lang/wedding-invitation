/**
 * 所有文案、日期、地点、照片都在这个文件里改。
 * 组件只负责排版，不写死任何内容。
 */

export const paper = {
  /** 报头名称 */
  name: '晨间号外',
  nameEn: 'THE MORNING EXTRA',
  /** 报头下方的小字，比如卷期 */
  volume: '第壹卷 · 婚礼特刊',
  /** 封面上的一句话 */
  coverLine: '本期专题：两位青年宣布结为夫妻',
  /** 封面按钮 */
  coverCta: '轻触翻开本报',
  /** 报头下方那行"天气"，纯装饰 */
  weather: '晴',
  /** 页脚小字 */
  footer: '本报为限量发行，仅送至亲友手中。',
}

export const couple = {
  groom: '林鸿杰',
  bride: '丛颖',
  groomEn: 'Lin Hongjie',
  brideEn: 'Cong Ying',
}

export const wedding = {
  /** ISO 日期时间，用于倒计时、日历。晚宴约 19:00 开始，仪式 19:10–19:40 */
  start: '2026-10-06T19:00:00+08:00',
  end: '2026-10-06T22:00:00+08:00',
  dateLabel: '二〇二六年十月六日',
  weekday: '星期二 · 国庆假期',
  timeLabel: '下午 5 时起迎宾 · 晚 7 时 开席',
  /** 农历日期请核对一次 */
  lunar: '农历八月廿六',
  venue: '漳浦金士顿酒店 · 国际厅',
  address: '福建省漳州市漳浦县 金士顿酒店',
  /** 地图上的婚礼城市，需与 journey.cities 里某一站同名 */
  city: '漳州',
  /** 高德坐标（GCJ-02）。目前是漳浦县城的大致位置，请在 https://lbs.amap.com/tools/picker 搜"漳浦金士顿酒店"取精确点 */
  lng: 117.6136,
  lat: 24.1175,
  dressCode: '轻松自然即可，深色系或花园感着装尤佳',
  parking: '酒店设有停车场（细节待补）',
  contactGroom: '138 0000 0000',
  contactBride: '139 0000 0000',
}

export const frontPage = {
  kicker: '本报讯',
  headline: '两位青年宣布结为夫妻',
  subhead: '十月六日傍晚，漳浦金士顿酒店，一场轻松自然的婚礼，请你来',
  deck: `据本报记者了解，${couple.groom}与${couple.bride}将于${wedding.dateLabel}在${wedding.city}漳浦举行婚礼，当晚七时开席。两人的故事，请见第二版专访。`,
  /** 头版主图，放在 public/photos/ 下。留空字符串时显示两位像素当事人的占位合影 */
  photo: '/photos/zhangzhou-03.jpg',
  photoCaption: '两位当事人于本刊拍摄现场。',
}

/** 照片的全局显示方式 */
export const photoStyle = {
  /** true：默认显示像素化版本，点一下看原图；false：直接显示原图（已做过后期的作品建议 false） */
  pixelate: false,
  /** 像素化的横向像素数。越大越接近原图，头版主图建议 120～180，小图 60～90 */
  colsLarge: 150,
  colsSmall: 72,
}

export const interview = {
  title: '本报专访',
  intro: '两位当事人接受了本报记者的独家采访，以下为对话节录。',
  qa: [
    {
      q: '你们是怎么认识的？',
      a: '一场朋友的生日聚会。他坐在角落里剥橘子，剥得很认真，一瓣一瓣分给旁边的人，分到我这里的时候刚好没了。后来他说那是故意的。',
      by: couple.bride,
    },
    {
      q: '第一次约会去了哪里？',
      a: '本来说好去看电影，结果那天影院停电，我们在门口的便利店坐了三个小时。回想起来那是我们最长的一次对话，后来再也没有那样好的机会。',
      by: couple.groom,
    },
    {
      q: '什么时候决定要结婚的？',
      a: '没有特别的一天。有一次搬家，把两个人的书混在一起放上书架，谁也没有再分开过。大概就是那时候。',
      by: couple.bride,
    },
    {
      q: '对婚礼有什么期待？',
      a: '希望大家吃得好，坐得舒服，不用赶时间。别的都不重要。',
      by: couple.groom,
    },
  ],
  /** 专访中间插的两张小图，放 public/photos/ 下；数组留空则不显示 */
  photos: [] as string[],
  photoCaptions: [] as string[],
}

export type City = {
  /** 城市名。在 src/map/cities.ts 里有坐标的城市不用填 lng/lat */
  name: string
  lng?: number
  lat?: number
  /** 城市名标签画在地标的哪一侧，用来避开重叠，默认右侧 */
  label?: 'left' | 'right' | 'top' | 'bottom'
  date: string
  title: string
  text: string
  /** 放在 public/photos/ 下，任意 jpg/png，页面会自动像素化，点击可看原图 */
  photos?: string[]
}

export const journey = {
  title: '足迹',
  intro: '本报整理了两人这些年一起去过的地方。点击任一城市，两位当事人会从所在之处走过去，届时可读到当地的简讯与照片。',
  /**
   * 城市不分先后，两人一开始站在婚礼城市（名字与 wedding.city 相同的那一站），点哪里就从当前位置走过去。
   * 想加多少城市都可以。下面的日期和文字都是占位，等你补真实内容；照片放进 public/photos/ 后把路径填到 photos 里。
   */
  cities: [
    {
      name: '北京',
      label: 'bottom',
      date: '（日期待补）',
      title: '北京',
      text: '（这一站的故事待补。）',
      photos: [],
    },
    {
      name: '张家口',
      label: 'left',
      date: '（日期待补）',
      title: '张家口',
      text: '（这一站的故事待补。）',
      photos: [],
    },
    {
      name: '秦皇岛',
      label: 'top',
      date: '（日期待补）',
      title: '秦皇岛',
      text: '（这一站的故事待补。）',
      photos: [],
    },
    {
      name: '沈阳',
      date: '（日期待补）',
      title: '沈阳',
      text: '（这一站的故事待补。）',
      photos: [],
    },
    {
      name: '威海',
      date: '（日期待补）',
      title: '威海',
      text: '（这一站的故事待补。）',
      photos: [],
    },
    {
      name: '上海',
      date: '（日期待补）',
      title: '上海',
      text: '（这一站的故事待补。）',
      photos: [],
    },
    {
      name: '西安',
      label: 'top',
      date: '（日期待补）',
      title: '西安',
      text: '（这一站的故事待补。）',
      photos: [],
    },
    {
      name: '成都',
      label: 'left',
      date: '（日期待补）',
      title: '成都',
      text: '（这一站的故事待补。）',
      photos: [],
    },
    {
      name: '乐山',
      label: 'right',
      date: '（日期待补）',
      title: '乐山',
      text: '（这一站的故事待补。）',
      photos: [],
    },
    {
      name: '大理',
      label: 'bottom',
      date: '二〇二二年五月',
      title: '洱海',
      text: '在洱海边坐了一个下午，谁也没提要走。',
      photos: [],
    },
    {
      name: '丽江',
      label: 'left',
      date: '二〇二二年五月',
      title: '古城',
      text: '从大理一路往北。晚上古城下了雨，石板路亮得像镜子。',
      photos: [],
    },
    {
      name: '厦门',
      label: 'top',
      date: '（日期待补）',
      title: '厦门',
      text: '（这一站的故事待补。）',
      photos: [],
    },
    {
      name: '东京',
      date: '二〇二四年春',
      title: '第一次出国',
      text: '樱花开到一半。在便利店买了两个饭团，坐在河边吃完。',
      photos: [],
    },
    {
      name: '漳州',
      label: 'bottom',
      date: wedding.dateLabel,
      title: '婚礼',
      text: `${wedding.venue}。故事在这里停一下，请见第四版赴宴指南。`,
      photos: [
        '/photos/zhangzhou-01.jpg',
        '/photos/zhangzhou-02.jpg',
        '/photos/zhangzhou-03.jpg',
        '/photos/zhangzhou-04.jpg',
      ],
    },
  ] as City[],
}

export const guide = {
  title: '赴宴指南',
  sections: [
    { label: '时间', value: `${wedding.dateLabel}（${wedding.weekday}）`, sub: wedding.timeLabel },
    { label: '地点', value: wedding.venue, sub: wedding.address },
    {
      label: '当晚',
      value: '17:00 迎宾合影 · 19:00 落座 · 19:10 仪式',
      sub: '19:40 开席 · 20:00 起逐桌敬酒 · 21:10 抽奖互动',
    },
    { label: '着装', value: wedding.dressCode },
    { label: '停车', value: wedding.parking },
  ],
}

export const closing = {
  title: '编后语',
  body: [
    '这份报纸没有广告，也没有社会新闻，只登了一件事：我们要结婚了。',
    '很多年前我们各自经历的事，好像都是为了在那个聚会上恰好坐得近一点。感谢在场的每一位，感谢你们在我们人生里出现过、还没有走开。',
    '十月六日晚上，请来喝一杯。',
  ],
  sign: `${couple.groom} & ${couple.bride}`,
  replyTitle: '回复本报',
  replyText: '看完请在微信里回我们一句「到」，好让我们安排座位。带家人朋友同来也请一并告知。',
}

export const music = {
  /** 放在 public/music.mp3；不存在则自动隐藏播放按钮 */
  src: '/music.mp3',
  title: 'Background Music',
}
