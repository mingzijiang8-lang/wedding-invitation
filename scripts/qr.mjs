// 打印一个二维码，手机扫码打开本地开发服务：node scripts/qr.mjs [url]
import qrcode from 'qrcode-terminal'
import { networkInterfaces } from 'node:os'

const lan = Object.values(networkInterfaces())
  .flat()
  .find((i) => i && i.family === 'IPv4' && !i.internal)?.address

const url = process.argv[2] ?? `http://${lan}:5180/`
console.log(`\n手机与电脑连同一 Wi-Fi，扫码打开：${url}\n`)
qrcode.generate(url, { small: true })
