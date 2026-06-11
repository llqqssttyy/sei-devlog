---
title: 'GitHub Pages에서 SPA 404 오류 해결 + Webpack 플러그인 자동화'
description: 'GitHub Pages에서 BrowserRouter 기반 SPA 새로고침 시 발생하는 404 문제를 해결하고 Webpack 플러그인으로 자동화한 과정을 다뤘습니다.'
pubDate: '2024-09-03'
updatedDate: '2026-06-10'
category: 'Infrastructure'
heroImage: '../../assets/posts/GitHub-Pages에서-SPA-404-오류-해결-Webpack-플러그인-자동화/thumbnail.webp'
---
## 문제

- BrowserRouter를 사용해 Route를 하는 상황.
- 경로 이동까지는 잘 되지만, 해당 페이지에서 새로고침을 하는 순간 GitHub Pages의 404페이지가 보인다.

<br/>

## 원인

SPA는 URL이 변경되더라도 페이지를 새로고침하지 않고 JavaScript를 통해 다른 페이지(또는 컴포넌트)를 렌더링한다. 

한편 GitHub Pages는 정적 사이트를 호스팅하기 때문에, 사용자가 특정 경로로 접근하면 해당 URL을 실제 파일 경로로 간주하고 그 경로에 해당하는 파일을 찾으려고 시도한다. 

이때 해당 경로에 파일이 존재하지 않으면 404 페이지가 표시된다.

<br/>

## 404.html로 해결하기

번들 파일의 index.html과 같은 레벨에 아래와 같은 404.html 파일을 생성하고, index.html에 script 태그를 추가하여 해결했다.

- **index.html**에 script 추가
```html
<script type="text/javascript">
  if (process.env.NODE_ENV === 'production') {
    // Single Page Apps for GitHub Pages
    // https://github.com/rafrex/spa-github-pages
    // Copyright (c) 2016 Rafael Pedicini, licensed under the MIT License
    // ----------------------------------------------------------------------
    // This script checks to see if a redirect is present in the query string
    // and converts it back into the correct url and adds it to the
    // browser's history using window.history.replaceState(...),
    // which won't cause the browser to attempt to load the new url.
    // When the single page app is loaded further down in this file,
    // the correct url will be waiting in the browser's history for
    // the single page app to route accordingly.
    (function (l) {
      if (l.search) {
        var q = {};
        l.search
          .slice(1)
          .split('&')
          .forEach(function (v) {
            var a = v.split('=');
            q[a[0]] = a.slice(1).join('=').replace(/~and~/g, '&');
          });
        if (q.p !== undefined) {
          window.history.replaceState(
            null,
            null,
            l.pathname.slice(0, -1) + (q.p || '') + (q.q ? '?' + q.q : '') + l.hash
          );
        }
      }
    })(window.location);
  }
</script>

```

- **404.html** 생성

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Single Page Apps for GitHub Pages</title>
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      // https://github.com/rafrex/spa-github-pages
      // Copyright (c) 2016 Rafael Pedicini,  licensed under the MIT License
      //  ---------------------------------------------- ------------------------
      // This script takes the current url and  converts the path and query
      // string into just a query string, and then  redirects the browser
      // to the new url with only a query string  and hash fragment,
      // e.g. http://www.foo.tld/one/two?a=b& c=d#qwe, becomes
      // http://www.foo.tld/?p=/one/two&  q=a=b~and~c=d#qwe
      // Note: this 404.html file must be at least  512 bytes for it to work
      // with Internet Explorer (it is currently >  512 bytes)

      // If you're creating a Project Pages site  and NOT using a custom domain,
      // then set segmentCount to 1 (enterprise   users may need to set it to > 1).
      // This way the code will only replace the  route part of the path, and not
      // the real directory in which the app  resides, for example:
      //  https://username.github.io/repo-name/one/two?  a=b&c=d#qwe becomes
      // https://username.github.io/repo-name/? p=/one/two&q=a=b~and~c=d#qwe
      // Otherwise, leave segmentCount as 0.
      var segmentCount = 1;

      var l = window.location;
      l.replace(
        l.protocol +
          '//' +
          l.hostname +
          (l.port ? ':' + l.port : '') +
          l.pathname
            .split('/')
            .slice(0, 1 + segmentCount)
            .join('/') +
          '/?p=/' +
          l.pathname.slice(1).split('/').slice(segmentCount).join('/').replace(/&/g, '~and~') +
          (l.search ? '&q=' + l.search.slice(1).replace(/&/g, '~and~') : '') +
          l.hash
      );
    </script>
  </head>
  <body></body>
</html>

```

**로직 요약**

- **`404.html`**:

    현재 URL의 경로의 pathname을  `?p=`라는 새로운 쿼리 문자열로 변경하고, 그 후 해당 URL로 리다이렉트한다.
    예를 들어, `http://www.foo.tld/one/two?a=b&c=d#qwe`라는 URL이 있으면, 이를 `http://www.foo.tld/?p=/one/two&q=a=b~and~c=d#qwe`로 변환한다.


    
- **`index.html`**:

    이렇게 되면 root url로 이동되어 index.html이 보여지는데, 앞서 `?p=`라는 고유한 규칙으로 pathname을 보내주었기 때문에 리다이렉트 정보를 판별할 수 있다. 
    현재 URL에 리다이렉트 정보가 포함되어 있다면 올바른 URL로 변환해 `window.history.replaceState(...)`를 사용하여 브라우저의 히스토리에 저장한다.
    
    
<br/>

### 빌드 시 자동으로 404.html 삽입하기

`npm run deploy` 명령어를 사용해 배포할 때마다 dist 폴더가 새롭게 생성되므로 매번 404.html을 수동으로 넣는 것이 비효율적이라고 생각했다. 

따라서 `copy-webpack-plugin` 라는 웹팩 플러그인을 사용해 public 디렉토리에 있는 404.html을 빌드 시 index.html과 같은 계층에 들어가도록 설정했다.

만약 해당 플러그인을 사용하고 있지 않다면 의존성을 추가해줘야 한다.

```bash
npm install copy-webpack-plugin --save-dev
```

그리고 webpack.config.js를 수정한다. 

```jsx
// ...
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 추가

module.exports = {
  // ...
  plugins: [
    // 이 부분을 추가한다.
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './public',
          to: './public',
          globOptions: {
            ignore: ['**/404.html'] // 404.html 파일을 제외하고 모든 파일을 복사
          }
        },
        {
          from: path.resolve(__dirname, './public/404.html'),
          to: path.resolve(__dirname, 'dist')
        }
      ]
    }),
  ],
  // ...
};
```

그럼 이렇게 잘 들어간다.👍

![](/posts/GitHub-Pages에서-SPA-404-오류-해결-Webpack-플러그인-자동화/image-01.webp)

<br/>

### HashRouter를 사용하지 않은 이유?

검색해 보니 BrowserRouter가 아닌 HashRouter를 변경하는 방법도 있었지만 다음과 같은 이유로 선택하지 않았다.

- `HashRouter`는 URL에 해시(`#`)를 포함시킨다. 예를 들어, `example.com/about` 대신 `example.com/#/about`와 같은 URL을 생성한다. 
- 이는 직관성이 떨어지고, # 뒤에 오는 내용은 실제 url이 아닌 클라이언트에서만 해석되는 section이므로 SEO(검색 엔진 최적화)에도 불리할 수 있다.
- [react router dom 공식 문서](https://reactrouter.com/en/main/router-components/hash-router)에도 꼭 필요한 경우가 아니라면 hash router를 사용하지 말라고 권고하고 있다.

SEO에 불리하다는 특징도 있지만 무엇보다도 URL의 가독성과 직관성이 떨어지는 점, 공식 문서에서 지양하라고 언급한 부분을 고려해 HashRouter를 사용하지 않았다.

<br/>

> **참고자료**
> - [gh-pages가 SPA를 지원하지 않아 404페이지가 뜰 때
](https://velog.io/@kya754/gh-pages-%EB%B0%B0%ED%8F%AC-%EC%8B%9C-URL-%EC%83%88%EB%A1%9C%EA%B3%A0%EC%B9%A8%EC%A7%81%EC%A0%91-%EC%9E%85%EB%A0%A5-%EB%AC%B8%EC%A0%9C)
