// Sinh apps-script/Index.html: toàn bộ app (JS + CSS) trong một file để Apps Script phục vụ qua doGet.
// Chạy: npm run build:gas-html   (cần chạy sau `vite build --mode gas --outDir dist-gas`)
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'dist-gas';
const assets = readdirSync(join(dir, 'assets'));
const js = assets.filter((f) => f.endsWith('.js'));
const css = assets.filter((f) => f.endsWith('.css'));
if (js.length !== 1 || css.length !== 1) throw new Error(`Cần đúng 1 file JS và 1 file CSS, có: ${assets.join(', ')}`);

// Font tự host không dùng được trong Apps Script; bỏ @font-face và tải Inter/Plus Jakarta Sans từ Google Fonts.
const style = readFileSync(join(dir, 'assets', css[0]), 'utf8').replace(/@font-face\{[^}]*\}/g, '');
// Không để chuỗi "</script" kết thúc thẻ script sớm.
const script = readFileSync(join(dir, 'assets', js[0]), 'utf8').replace(/<\/script/gi, '<\\/script');

const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<base target="_top" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap&subset=vietnamese" />
<style>${style}</style>
</head>
<body>
<div id="root"></div>
<script type="module">${script}</script>
</body>
</html>
`;
writeFileSync('apps-script/Index.html', html);
console.log(`Đã sinh apps-script/Index.html (${Math.round(html.length / 1024)} KB)`);
