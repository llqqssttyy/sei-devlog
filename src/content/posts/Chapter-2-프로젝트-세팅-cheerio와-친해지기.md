---
title: '[Chapter 2] 프로젝트 세팅 + cheerio와 친해지기'
description: 'Node.js 크롤러 프로젝트를 시작하며 개발 환경을 세팅하고, cheerio로 HTML을 다루는 기본 흐름을 정리했습니다.'
pubDate: '2023-12-09'
updatedDate: '2026-05-21'
category: 'Infrastructure'
heroImage: '../../assets/posts/Chapter-2-프로젝트-세팅-cheerio와-친해지기/thumbnail.webp'
---
> 티스토리 글 이전 중 - [원본 시리즈 23.06.09 - 23.06.14](https://ekundo.tistory.com/category/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/SMU-Notification)

> [프로젝트 저장소](https://github.com/llqqssttyy/SMU-Notification)

<br/>

## 1️⃣ 프로젝트 세팅하기
첫 node.js 프로젝트인지라 모르는 게 많았기 때문에 세팅하는 데 어려움이 있었다. 🥲 비슷한 프로젝트를 원하는 다른 분들에게 도움이 되고자 자세히 적어보려 한다.


사용할 도구 및 환경은 다음과 같다.

|**도구 및 환경** | **설명** |
|--|--|
| **node.js** | JS에 대한 숙련도를 높이기 위해 node.js 환경에서 구현했다. 다만 DB를 사용하지 않아서 express와 같은 백엔드 프레임워크는 사용하지 않았다.|
| **cheerio** | 스크래핑한 공지사항 페이지에서 데이터를 뽑고, 이메일 전송용 html을 동적으로 생성하기 위해 사용한다. |
| **axios** | HTTP 통신으로 스크래핑할 페이지의 html 문서를 불러오는 데 사용한다. |
| **nodemailer** | 이메일 전송할 때 필요한 node.js 어플리케이션용 모듈이다. |
| **dotenv** | 이메일 주소, 비밀번호와 같이 민감한 정보를 환경변수로 관리하고, 이를 편리하게 사용하기 위해 설치한다. |
| **GitHub Actions** | 원하는 시점에 프로그램을 돌리기 위해서(스케줄링) GitHub Actions의 cron 설정을 이용한다. |


<br/>

이번 챕터에서 위에 작성한 모든 라이브러리를 세팅하지는 않을 것이다. 아래 내용은 GitHub와 npm을 사용한 axios, cheerio 다운로드까지만 다루고 있다.



#### 1. GitHub에 레포지토리를 생성 후 클론
	```
	git clone "repository url"
	```

#### 3. npm 초기화 및 라이브러리 설치
	```
    # 기본 세팅으로 초기화
	npm init -y 
    
    # axios와 cheerio 다운로드. 
	npm install axios cheerio 
	```

#### 4. `index.js` 파일 생성
index.js 파일은 node.js 프로그램이 실행될 때 entry point가 되는 곳이다. 만약 실행이 되지 않는다면 package.json의 "main" 속성 값으로 "index.js"가 잘 들어가 있는지 확인하자.


#### 5. `.gitignore` 파일 작성
GitHub엔 종류별로 이미 잘 만들어진 gitignore 파일을 공유하는 레포지터리가 있다. [**이곳**](https://github.com/github/gitignore/blob/main/Node.gitignore)에서 `Node.gitignore` 파일 내용을 복사해 우리의 `.gitignore` 파일에 붙여 넣는다.



일차적인 세팅은 끝났다!


<br/>

---

## 2️⃣ Cheerio

> Cheerio는 Node.js 환경에서 사용되는 간편하고 유연한 HTML 파싱 및 조작 라이브러리다.

사용 방법이 jQuery와 유사하지만, 근본적으로는 다르다.

-   Cheerio은 Node.js 환경에서 작동하지만, jQuery는 브라우저에서 동작한다.
-   Cheerio는 서버 측에서 사용하기 적합하며, jQuery는 클라이언트 측에서 사용하기 적합하다.
-   Cheerio는 HTML 혹은 XML을 파싱하여 만든 **가상 DOM 구조를 조작**하고, jQuery는 **브라우저의 실제 DOM을 조작한다.**


<br/>

---

## 3️⃣ Getting Started

Cheerio [공식 사이트의 Getting Started](https://cheerio.js.org/docs/intro "Cheerio Getting Started")를 따라가 보면서 **무엇을 위한 라이브러리**이며 **어떤 걸 할 수 있는지** 탐색해 보려고 한다.


### 1. Importing Cheerio

JavaScript에 cheerio 모듈을 임포트해준다.

```js
import * as cheerio from 'cheerio';			// ES module
const cheerio = require('cheerio');			// Commnon JS module
```

나는 import문(ES module)으로 넣어줬다.

> **Trouble Shooting!  **
> (node:64929) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.

그런데 이대로 index.js를 실행해 보면 위와 같은 에러가 뜬다. 에러 메시지에 쓰여있듯 ES module을 사용하기 위해선 package.json 파일에 "type"과 "module"을 키와 값으로 넣어줘야 한다. 나와 같은 환경에서 세팅한다면 "repository" 속성에 "type" 속성이 있을 텐데 이는 깃 관련 설정이니 무시하고 바깥에 `"type": "module"`을 따로 추가하면 된다!

<br/>

### 2. Using Cheerio

다시 복기하자면 Cheerio는 HTML를 불러와 가상돔을 조작하는 라이브러리다. 따라서 가장 처음엔 조작할 HTML 문서를 불러오는 과정이 필요하다. `load()` 는 이것을 위한 함수다. `HTML 문서`를 인자로 받아 DOM 조작을 돕는 함수를 제공하는 `Cheerio 객체`를 반환한다.

```js
const $ = cheerio.load('<h2 class="title">Hello world</h2>');
```

<br/>

#### Usage 1 - Selecting Elements

cheerio는 js의 query selector처럼 css 선택자를 사용하여 원하는 element를 선택하고, 원하는 대로 문서를 조작할 수 있는 API를 제공한다. 위에서 로드한 문서의 h2 태그 안에 있는 'Hello world'를 추출하는 코드를 짜보자.

```js
$('h2.title').text(); // Hello world
```

#### Usage 2 - Traversing the DOM

**traversing**이란 **루트 노드에서 시작하여 자식 및 형제 노드를 탐색하는 과정**을 말하며,** 웹 페이지의 HTML 요소 구조를 탐색하는 작업**을 의미한다.  

cheerio는 $() 함수를 통해서 탐색의 시작이 되는 루트 노드를 cheerio 객체로 받아볼 수 있다. 이렇게 받은 요소를 find(), children(), contents() 등 제공되는 API를 통해 탐색할 수 있다.

```js
$('h2.title').find('.subtitle').text();
```

#### Usage 3 - Manipulating Elements

특정 노드를 선택했다면 내가 원하는 대로 조작할 수도 있다. 아래 예제는 h2 태그 안의 text를 바꾸고, 자식 요소를 추가하는 예제이다.

```js
$('h2.title').text('Hello there!');
$('h2').after('<h3>How are you?</h3>');
```

<br/>
<br/>

---

## 🚀 정리해 보기

cheerio는 **가상 DOM의 요소를 선택(selecting), 탐색(traversing), 조작(manipulation)**하기 위한 라이브러리이며, 이러한 기능을 사용해 HTML에서 원하는 정보만을 얻는 크롤링을 가능하게 한다. 


cheerio를 사용하기 위해서는 우선 가공할 HTML 문서가 필요하다. 따라서 다음 포스트는 axios를 사용해서 크롤링할 html 문서를 불러오는 작업을 다룬다.
