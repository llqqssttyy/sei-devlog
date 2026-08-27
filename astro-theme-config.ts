import {
  CATEGORY_AI,
  CATEGORY_BOOK,
  CATEGORY_FRONTEND,
  CATEGORY_INFRASTRUCTURE,
  CATEGORY_OPEN_SOURCE,
  CATEGORY_OTHER,
  CATEGORY_WOOWA_COURSE,
} from './src/config/categories';

type NavItem = {
  label: string;
  href: string;
};

/**
 * astro-theme-config.ts
 *
 * Central configuration for the Tone theme.
 * Most site-level customization should happen in this file.
 */

const config = {
  site: {
    /** Production origin, used for canonical links, sitemap, and Open Graph metadata. */
    url: 'https://dan.io.kr',
    /** Subpath such as '/repo-name'. Keep empty when deploying at a domain root. */
    base: '',
    lang: 'ko',
    locale: 'ko_KR',
    dateLocale: 'ko-KR',
    title: 'Dan',
    logoLabel: 'Dan',
    description: '',
    author: 'Kim DaEun',
    /** Optional absolute or root-relative image URL for homepage/search/about social previews. */
    defaultOgImage: '/og.png',
  },

  nav: [
    { label: 'Posts', href: '/posts' },
    { label: 'About', href: '/about' },
  ] as NavItem[],

  footerNav: [
    { label: 'Posts', href: '/posts' },
    { label: 'About', href: '/about' },
    { label: 'Search', href: '/search' },
  ] as NavItem[],

  content: {
    categoryOrder: [
      CATEGORY_AI,
      CATEGORY_FRONTEND,
      CATEGORY_WOOWA_COURSE,
      CATEGORY_INFRASTRUCTURE,
      CATEGORY_OPEN_SOURCE,
      CATEGORY_BOOK,
      CATEGORY_OTHER,
    ],
  },

  behavior: {
    smoothScroll: true,
  },

  comments: {
    // One-line switch after you fill the giscus values:
    // mode: 'off'           -> no comments
    // mode: 'giscus'        -> original giscus theme
    // mode: 'giscus-custom' -> Tone custom giscus theme
    // Local preview can also use PUBLIC_GISCUS_MODE and PUBLIC_GISCUS_* in .env.local.
    mode: 'giscus-custom',
    provider: 'giscus',
    giscus: {
      repo: 'llqqssttyy/sei-devlog',
      repoId: 'R_kgDOSn7ZEA',
      category: 'Announcements',
      categoryId: 'DIC_kwDOSn7ZEM4C-7a7',
      mapping: 'pathname',
      strict: '0',
      reactionsEnabled: '1',
      emitMetadata: '1',
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme',
      customLightTheme: '/giscus-light.css',
      customDarkTheme: '/giscus-dark.css',
      lang: 'ko',
      loading: 'eager',
    },
  },

  social: {
    website: 'https://dan.io.kr', // e.g. 'https://your-site.com'
    email: 'midekuna@gmail.com', // e.g. 'hello@your-site.com'
    linkedin: 'https://www.linkedin.com/in/%EB%8B%A4%EC%9D%80-%EA%B9%80-24544b246/', // e.g. 'https://www.linkedin.com/in/yourhandle'
    github: 'https://github.com/llqqssttyy', // e.g. 'https://github.com/yourhandle'
  },

  about: {
    /** Profile image URL. Leave empty to use the text-only About layout. */
    profileImage: '',
    name: 'Kim DaEun',
    role: '문제 정의부터 시작하는 프론트엔드 개발자.',
    location: 'Korea',
    focus: 'Frontend architecture, product systems, SEO/GEO, DX, and useful small tools.',
    lead: '',
    headline: ['Build with', 'reasons.'],
    statementLabel: 'Work',
    statementTitle: '구현보다 먼저 문제를 정의합니다.',
    statement:
      '프론트엔드 개발자로서 제품의 표면을 만드는 일에 머무르지 않고, 정보 구조, 성능, 접근성, 검색 노출, 개발 워크플로우까지 함께 살핍니다. ',
    careerLabel: 'Career',
    career: [
      {
        period: 'Freelance Project',
        title: 'Web Fullstack',
        description:
          'B2B 기업의 웹사이트와 어드민을 단독으로 설계 및 구현했습니다. AI Agent를 만들어 , SEO/GEO, 정보 구조, 문의 관리 흐름, Cloudflare 기반 인프라를 정리해 검색 노출과 운영 효율을 개선했습니다.',
      },
      {
        period: '월급쟁이부자들(Weolbu)',
        title: 'Frontend',
        description:
          '강의와 커뮤니티 도메인에서 제품 리뉴얼, 디자인 시스템, 성능 개선, DX 개선을 수행했습니다. 반복 구현을 추상화하고 비효율적인 워크플로우를 구조화해 개발 생산성을 높였습니다.',
      },
      {
        period: '우아한테크코스 6기(Woowa Course 6th)',
        title: 'Web Frontend',
        description:
          'React와 TypeScript 기반의 프론트엔드 기초를 다지고, 팀 프로젝트에서 리크루팅 플랫폼의 동적 폼, 디자인 시스템, 지원자 관리 기능을 구현했습니다.',
      },
    ],

    interests: [
      'Communication is the job',
      'Work can also be your hobby',
      'Get 1% better every day',
      'Lead with empathy. They might just be having a bad day',
    ],
    interestsLabel: 'Things I Believe',
    interestsHeading: '나를 만드는 문장들',
  },
};

export default config;
