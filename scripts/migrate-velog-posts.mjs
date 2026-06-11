import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const VELOG_GRAPHQL_ENDPOINT = 'https://v2.velog.io/graphql';
const VELOG_USERNAME = 'llqqssttyy';
const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');
const ASSETS_POSTS_DIR = path.join(process.cwd(), 'src/assets/posts');
const PUBLIC_POSTS_DIR = path.join(process.cwd(), 'public/posts');
const POST_LIMIT = 20;

const DESCRIPTIONS_BY_SLUG = {
  'Chapter-1-크롤러를-만들자':
    '크롤링을 배우게 된 계기와 데이터셋 구축 도구를 만들기 전, 크롤러 프로젝트를 시작하며 정리한 배경과 목표를 담았습니다.',
  'Chapter-2-프로젝트-세팅-cheerio와-친해지기':
    'Node.js 크롤러 프로젝트를 시작하며 개발 환경을 세팅하고, cheerio로 HTML을 다루는 기본 흐름을 정리했습니다.',
  'FE-우아한테크코스-6기-최종-합격':
    '우아한테크코스 6기 프론트엔드 과정에 최종 합격하기까지의 지원 과정, 준비 방식, 회고와 지원자에게 전하고 싶은 말을 정리했습니다.',
  'FE-우테코-6기-최종-코딩-테스트-회고':
    '우테코 6기 최종 코딩 테스트를 준비하며 세운 전략, 스터디와 시험 당일 경험, 그리고 결과를 기다리며 남긴 회고를 담았습니다.',
  'FE-우테코-6기-프리코스-1주차-회고':
    '우테코 프리코스 1주차를 보내며 미션을 수행한 방식, 커뮤니티에서 얻은 자극, 학습 루틴과 첫 주의 감정을 기록했습니다.',
  'FE-우테코-6기-프리코스-2주차-회고':
    '프리코스 2주차 미션을 진행하며 디자인 패턴, 읽기 쉬운 코드, 협업을 의식한 구현 방식과 마음가짐의 변화를 돌아봤습니다.',
  'FE-우테코-6기-프리코스-3주차-회고-6zcqs6o1':
    '프리코스 3주차 미션에서 공통 피드백을 반영하고, README 작성, 테스트, 객체 책임 분리를 학습 목표로 삼은 과정을 정리했습니다.',
  'FE-우테코-프리미션-4주차-프리코스-마무리':
    '프리코스 4주차 크리스마스 프로모션 미션을 마무리하며 요구사항 분석, 문서화, 구현 전략과 한 달간의 성장을 회고했습니다.',
  'GitGitHub-서브모듈을-활용해-프리코스-저장소-관리하기':
    '우테코 프리코스 미션 저장소들을 한곳에서 관리하기 위해 Git 서브모듈을 적용하고, 설정 과정과 사용법을 정리했습니다.',
  'GitHub-Pages에서-SPA-404-오류-해결-Webpack-플러그인-자동화':
    'GitHub Pages에서 BrowserRouter 기반 SPA 새로고침 시 발생하는 404 문제를 해결하고 Webpack 플러그인으로 자동화한 과정을 다뤘습니다.',
  'JS-싱글-스레드-언어에서-비동기가-가능한-이유-이벤트-루프-태스크-큐-Web-API':
    '자바스크립트가 싱글 스레드로 동작하면서도 비동기 처리를 할 수 있는 이유를 이벤트 루프, 태스크 큐, Web API 관점에서 설명했습니다.',
  'Playwright-도입기':
    '수동 QA의 한계를 줄이기 위해 Playwright를 도입하며 Cypress와 비교하고, E2E 테스트 구조와 적용 경험을 정리했습니다.',
  'Trouble-Shooting-왜-내-SVG는-크기가-변하지-않았던-걸까':
    'SVG 아이콘 크기가 예상대로 바뀌지 않았던 문제를 추적하며 viewBox, 좌표계, wrapper 구조를 중심으로 원인을 정리했습니다.',
  'reac-hook-form-톺아보기1-어떻게-렌더링-성능을-개선했을까':
    'react-hook-form이 폼 상태를 관리하면서 불필요한 렌더링을 줄이는 방식을 살펴보고, 프로젝트에 도입한 이유를 정리했습니다.',
  '우테코-6기-FE-테코톡-회고':
    '우테코 테코톡에서 컴포넌트 합성을 주제로 발표하며 준비한 메시지, 발표 구성, 긴장과 응원까지의 과정을 회고했습니다.',
  '캐시-관리-전략-수립하기':
    '웹 캐시를 안전하게 운영하기 위해 필요한 만료, 무효화, 업데이트 전략을 정리하고 팀 프로젝트에서의 적용 방식을 설명했습니다.',
  '프론트엔드에서-캐시-어떻게-관리해요':
    '프론트엔드에서 캐시가 필요한 이유와 HTTP 캐시의 기본 개념, Cache-Control 헤더를 활용한 만료 정책을 정리했습니다.',
};

const POSTS_QUERY = `
  query Posts($cursor: ID, $username: String, $temp_only: Boolean, $tag: String, $limit: Int) {
    posts(cursor: $cursor, username: $username, temp_only: $temp_only, tag: $tag, limit: $limit) {
      id
      title
      short_description
      thumbnail
      url_slug
      released_at
      updated_at
      tags
      is_private
    }
  }
`;

const POST_QUERY = `
  query ReadPost($username: String, $url_slug: String) {
    post(username: $username, url_slug: $url_slug) {
      id
      title
      released_at
      updated_at
      tags
      body
      short_description
      thumbnail
      url_slug
    }
  }
`;

async function requestVelog(query, variables) {
  const response = await fetch(VELOG_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Velog request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  if (payload.errors?.length) {
    throw new Error(`Velog GraphQL error: ${JSON.stringify(payload.errors)}`);
  }

  return payload.data;
}

async function fetchAllPosts() {
  const posts = [];
  let cursor = null;

  while (true) {
    const data = await requestVelog(POSTS_QUERY, {
      cursor,
      username: VELOG_USERNAME,
      temp_only: false,
      tag: null,
      limit: POST_LIMIT,
    });

    const page = data.posts.filter((post) => !post.is_private);
    posts.push(...page);

    if (data.posts.length < POST_LIMIT) {
      break;
    }

    cursor = data.posts.at(-1).id;
  }

  return posts;
}

async function fetchPostBody(urlSlug) {
  const data = await requestVelog(POST_QUERY, {
    username: VELOG_USERNAME,
    url_slug: urlSlug,
  });

  if (!data.post?.body) {
    throw new Error(`Could not fetch body for ${urlSlug}`);
  }

  return data.post;
}

function includesAny(values, needles) {
  return needles.some((needle) => values.some((value) => value.includes(needle)));
}

function selectCategory(post) {
  const tags = post.tags ?? [];
  const searchable = [post.title, ...tags];

  if (includesAny(searchable, ['우아한테크코스', '우테코', '프리코스', '테코톡'])) {
    return 'Woowa Course';
  }

  if (
    includesAny(tags, [
      'JavaScript',
      'Web API',
      '이벤트 루프',
      '태스크 큐',
      'form',
      'e2e',
      '캐시',
      '리액트',
      '컴포넌트 합성',
    ])
  ) {
    return 'Frontend';
  }

  if (includesAny(tags, ['Git&Github', 'gh-pages', 'node.js', 'cheerio', '스크래핑', '크롤링'])) {
    return 'Infrastructure';
  }

  return 'Other';
}

function stripControlCharacters(value) {
  return String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
}

function toDateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function escapeYamlString(value) {
  return stripControlCharacters(value).replaceAll('\\', '\\\\').replaceAll("'", "''");
}

function normalizeDescription(value) {
  return stripControlCharacters(value).replaceAll('\r\n', '\n').replace(/\s+/g, ' ').trim();
}

function buildFrontmatter(post, heroImagePath) {
  const fields = [
    ['title', post.title],
    ['description', DESCRIPTIONS_BY_SLUG[post.url_slug] ?? normalizeDescription(post.short_description || post.title)],
    ['pubDate', toDateOnly(post.released_at)],
    ['updatedDate', toDateOnly(post.updated_at)],
    ['category', selectCategory(post)],
  ];

  if (heroImagePath) {
    fields.push(['heroImage', heroImagePath]);
  }

  return ['---', ...fields.map(([key, value]) => `${key}: '${escapeYamlString(value)}'`), '---', ''].join(
    '\n',
  );
}

function findVelogImageReferences(markdown) {
  const references = [];
  const markdownMatches = markdown.matchAll(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/g);
  const htmlMatches = markdown.matchAll(/<img\b[^>]*\bsrc=(["'])(https?:\/\/.*?)\1[^>]*>/gs);

  for (const match of markdownMatches) {
    references.push({
      rawUrl: match[1],
      cleanUrl: match[1],
    });
  }

  for (const match of htmlMatches) {
    references.push({
      rawUrl: match[2],
      cleanUrl: match[2].replace(/\s+/g, ''),
    });
  }

  return references;
}

async function downloadImage(url, outputPath) {
  let response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0' },
  });

  if (!response.ok) {
    const fallbackUrl = getFallbackImageUrl(url);

    if (fallbackUrl) {
      response = await fetch(fallbackUrl, {
        headers: { 'user-agent': 'Mozilla/5.0' },
      });
    }
  }

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status} ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const webpBuffer = await sharp(buffer, { animated: true, limitInputPixels: false })
    .webp({ quality: 82 })
    .toBuffer();
  await writeFile(outputPath, webpBuffer);
}

function getFallbackImageUrl(url) {
  const devToSourceUrl = url.match(/\/(https:\/\/devtolydiahallie\.s3-us-west-1\.amazonaws\.com\/[^/]+)$/)?.[1];

  if (!devToSourceUrl) {
    return null;
  }

  return `https://media2.dev.to/dynamic/image/width%3D800%2Cheight%3D%2Cfit%3Dscale-down%2Cgravity%3Dauto%2Cformat%3Dauto/${encodeURIComponent(devToSourceUrl)}`;
}

async function localizeImages(markdown, slug) {
  const imageReferences = findVelogImageReferences(markdown);
  let rewritten = markdown;

  if (imageReferences.length === 0) {
    return rewritten;
  }

  const outputDir = path.join(PUBLIC_POSTS_DIR, slug);
  await mkdir(outputDir, { recursive: true });

  const downloadedImages = new Map();

  for (const reference of imageReferences) {
    if (downloadedImages.has(reference.cleanUrl)) {
      rewritten = rewritten.split(reference.rawUrl).join(downloadedImages.get(reference.cleanUrl));
      continue;
    }

    const index = downloadedImages.size;
    const fileName = `image-${String(index + 1).padStart(2, '0')}.webp`;
    const outputPath = path.join(outputDir, fileName);
    const publicPath = `/posts/${slug}/${fileName}`;

    await downloadImage(reference.cleanUrl, outputPath);
    downloadedImages.set(reference.cleanUrl, publicPath);
    rewritten = rewritten.split(reference.rawUrl).join(publicPath);
  }

  return rewritten;
}

async function localizeThumbnail(post) {
  if (!post.thumbnail) {
    return null;
  }

  const fileName = 'thumbnail.webp';
  const outputDir = path.join(ASSETS_POSTS_DIR, post.url_slug);
  const outputPath = path.join(outputDir, fileName);

  await mkdir(outputDir, { recursive: true });
  await downloadImage(post.thumbnail, outputPath);

  return `../../assets/posts/${post.url_slug}/${fileName}`;
}

async function writePost(post) {
  const body = stripControlCharacters(await localizeImages(post.body, post.url_slug));
  const heroImagePath = await localizeThumbnail(post);
  const content = `${buildFrontmatter(post, heroImagePath)}${body.trim()}\n`;
  const outputPath = path.join(POSTS_DIR, `${post.url_slug}.md`);

  await mkdir(POSTS_DIR, { recursive: true });
  await writeFile(outputPath, content);

  return outputPath;
}

async function main() {
  const posts = await fetchAllPosts();
  console.log(`Found ${posts.length} public Velog posts.`);

  for (const summary of posts) {
    const post = await fetchPostBody(summary.url_slug);
    const outputPath = await writePost(post);
    console.log(`Migrated: ${post.title} -> ${path.relative(process.cwd(), outputPath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
