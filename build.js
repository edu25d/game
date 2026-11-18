/**
 * build.js — Vercel 빌드 스크립트
 * 환경변수(SUPABASE_URL, SUPABASE_ANON_KEY)를 env-config.js로 주입
 *
 * Vercel 배포 시 자동으로 실행되며, 생성된 dist/ 폴더를 배포합니다.
 * env-config.js는 Git에 커밋되지 않습니다 (.gitignore 등록).
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const SRC_DIR = __dirname;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERROR: SUPABASE_URL 또는 SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  console.error('Vercel Settings > Environment Variables에서 두 변수를 모두 추가하세요.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

console.log('빌드 시작...\n');

fs.mkdirSync(DIST_DIR, { recursive: true });

// 정적 파일 복사
const STATIC_FILES = [
  'index.html', 'style.css', 'game.js', 'stages.js',
  'supabase.js', 'vercel.json'
];

STATIC_FILES.forEach(f => {
  const src = path.join(SRC_DIR, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST_DIR, f));
    console.log('  ✓ ' + f);
  }
});

// 서브디렉터리 복사
['audio', 'keyboard', 'supabase'].forEach(d => {
  const src = path.join(SRC_DIR, d);
  if (fs.existsSync(src)) {
    fs.cpSync(src, path.join(DIST_DIR, d), { recursive: true });
    console.log('  ✓ ' + d + '/');
  }
});

// env-config.js 생성 (환경변수 주입)
const envConfig = `
(function () {
  window.__SUPABASE_URL = ${JSON.stringify(SUPABASE_URL)};
  window.__SUPABASE_ANON_KEY = ${JSON.stringify(SUPABASE_ANON_KEY)};
})();
`.trim() + '\n';

fs.writeFileSync(path.join(DIST_DIR, 'env-config.js'), envConfig, 'utf-8');
console.log('  ✓ env-config.js (환경변수 주입)');

// README.md 복사
const readmeSrc = path.join(SRC_DIR, 'README.md');
if (fs.existsSync(readmeSrc)) {
  fs.copyFileSync(readmeSrc, path.join(DIST_DIR, 'README.md'));
  console.log('  ✓ README.md');
}

console.log('\n빌드 완료: ' + DIST_DIR);
