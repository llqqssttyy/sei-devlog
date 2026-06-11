---
title: 'Playwright 도입기'
description: '수동 QA의 한계를 줄이기 위해 Playwright를 도입하며 Cypress와 비교하고, E2E 테스트 구조와 적용 경험을 정리했습니다.'
pubDate: '2024-10-20'
updatedDate: '2026-06-08'
category: 'Frontend'
heroImage: '../../assets/posts/Playwright-도입기/thumbnail.webp'
---
## E2E 테스트 도입 배경

크루루 팀은 그동안 E2E 테스트 없이 문서를 기반으로 QA를 진행해 왔습니다.

기존 문서에는 주요 사용자 시나리오와 각 플로우에서 점검해야 할 사항들이 체크리스트 형태로 정의되어 있었습니다.

![](/posts/Playwright-도입기/image-01.webp)


하지만 이러한 QA 방식은 결국 수작업으로 진행될 수밖에 없으며, 기능이 추가되거나 수정될 때 발생할 수 있는 영향을 정확히 파악하기 어려웠습니다. 이에 따라 **체계적이고 효율적인 품질 관리를 위해 E2E 테스트 자동화를 도입**하게 되었습니다.

---

## Cypress vs Playwright

크루루 팀은 Cypress와 Playwright를 조사하고 비교했습니다.

### Cypress란?

> E2E 테스트 도구로, JavaScript와 TypeScript로 작성된 웹 애플리케이션을 테스트한다. **DOM에 직접 접근해 애플리케이션과 상호작용**하는 방식으로, **브라우저와의 통합**이 잘 되며 주로 개발 과정에서 바로 사용할 수 있는 편리한 도구다.
> 

### 주요 특징

- 사용하기 쉽고 설치가 간단하다.
- 개발 중간에 빠르게 테스트를 진행할 때 유용하다.

### Playwright란?

> Microsoft에서 개발한 오픈소스 E2E 테스트 도구로, 하나의 API로 다양한 브라우저에 대응해 테스트가 가능하다. **테스트 병렬 실행**, **네트워크 제어**, **스크린샷과 비디오 녹화 등 고급 기능을 제공**한다.
> 

### 주요 특징

- 브라우저 지원 폭이 넓다.(Chromium, Firefox, WebKit)
- 테스트 병렬 실행, 네트워크 제어, 스크린샷과 비디오 녹화 등 고급 기능을 제공한다.
- 더 세밀한 조건과 고급 기능을 제공한다.


> #### 💡부가 정보
Playwright**는 **DevTools 프로토콜**과 **WebSocket**을 사용해 상호작용하기 때문에 브라우저의 동작을 내부적으로 더 깊이 제어할 수 있는 API를 사용할 수 있습니다.

<br/>

두 도구의 차이점을 표로 정리해보면 다음과 같습니다.

|  | **Cypress** | **Playwright** |
| --- | --- | --- |
| **테스트 지원 브라우저** | Chromium, firefox | Chromium, Firefox, WebKit. 크로스 플랫폼, 크로스 브라우저, 모바일 테스트 가능 |
| **설치 및 설정** | 설치 및 설정이 매우 간단함 | 설정이 다소 복잡하지만 유연성 제공 |
| **병렬 테스트** | 무료 플랜에서는 미지원 | 기본적으로 지원 |
| **Headless 모드(브라우저 없이 백그라운드에서 실행)** | 기본 **headed**. headless는 Command Line으로 지원 | 기본 **headless**. headed는 Command Line으로 지원 |
| **커뮤니티 및 생태계** | 큰 커뮤니티와 생태계 | cypress 보단 작지만 성장 중 |
| **디버깅** | 실시간 브라우저, UI 통합, 디버깅 도구 제공 | VS Code degugger 제공, 실시간 브라우저 디버깅, Playwright Inspector를 통한 GUI 디버깅 |
| **공식 문서** | [매우 친절(playground, 다양한 케이스 가이드)](https://docs.cypress.io/guides/overview/why-cypress) | [친절](https://playwright.dev/docs/intro) |
| **대기 메커니즘** | 자동 대기 | 자동 대기 + 세밀한 대기 조건 지정 |

<br/>

### 크루루의 선택

결론적으로 크루루 프론트엔드 팀은 **Playwright**를 테스트 도구로 선정했습니다. 논의 시 가장 중요하게 생각한 부분은 **병렬 테스트 가능 여부**와 **브라우저 지원폭**이었습니다. 

병렬 테스트는 테스트 실행 시간을 단축할 수 있는 핵심 요소라고 판단했으며, 데모데이 요구사항 중 타겟 브라우저에서의 작동 여부를 검증해야 하는 항목이 있었기 때문에, Playwright의 테스트 통과 여부를 품질 기준으로 활용할 수 있다고 판단했습니다.

추가적으로, 팀원들 모두가 Cypress를 사용한 경험이 있음에도 불구하고, 오히려 Playwright의 API가 더 친숙하게 느껴진다는 의견도 있었습니다. 

Cypress는 기본적으로 체이닝 방식을 사용해 코드를 작성하기 때문에 각 함수나 matcher를 사용하는 방법에 익숙해지는 데 어려움이 있을 수 있다는 점에서 러닝 커브가 존재했습니다. 

반면, Playwright는 locator로 찾은 요소를 변수에 담고 해당 요소에서 함수를 호출하는 방식으로, JavaScript로 웹 개발을 할 때와 유사해 심리적인 부담이 덜 느껴졌습니다.

---

## Playwright 설정

[Installation | Playwright](https://playwright.dev/docs/intro)

`npm init playwright@latest`만 실행해주면 설정에 필요한 모든 파일을 알아서 생성해 간편하게 세팅을 완료할 수 있습니다. 저희는 기본 설정 파일을 프로젝트에 맞게 조금 수정해주었습니다.

### config 파일 생성하기

- 코드
    
    ```tsx
    import { defineConfig, devices } from '@playwright/test';
    
    import dotenv from 'dotenv';
    import path from 'path';
    
    dotenv.config({ path: path.resolve(__dirname, '.env.local') });
    
    export default defineConfig({
      testDir: './e2e',
      fullyParallel: true,
      // reporter: [['./e2e/slack-reporter.ts'], ['html'], ['list']],
      reporter: [['html'], ['list']],
    
      use: {
        /* `await page.goto('/')`와 같은 액션에서 사용할 기본 URL 설정 */
        baseURL: process.env.DOMAIN_URL,
        trace: 'on-first-retry',
      },
    
      projects: [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
      ],
    });
    
    ```
    
- `testDir: ‘./e2e’`
    
    저희 프로젝트는 RTL도 사용하고 있어 유닛 테스트와 디렉토리를 분리해주었습니다.
    
- `fullyParallel: true`
    
    모든 테스트가 병렬로 실행되도록 합니다. 이를 통해 테스트 실행 시간을 단축할 수 있습니다.
    
- `reporter`
    
    옵션으로 다양한 형태의 리포터를 설정할 수 있습니다. 이는 아래에서 다시 자세히 다룹니다.
    
- `projects`
    
    테스트를 실행할 환경(브라우저)를 정의합니다. 저희 팀은 chromium, firefox, webkit을 포함시켰습니다.
    
- ci 관련 코드
    
    ⇒ E2E를 ci에 포함시키지 않을 것이기 때문에 모두 삭제해줬습니다.
    
    
<br/>


### Reporter

Reporter는 테스트의 실행 결과를 알려주는 수단입니다. 기본 reporter는 ‘list’로, cli에 결과를 보여주는 리포터입니다.

```tsx
Running 124 tests using 6 workers

 1  ✓ should access error in env (438ms)
 2  ✓ handle long test names (515ms)
 3  x 1) render expected (691ms)
 4  ✓ should timeout (932ms)
 5    should repeat each:
 6  ✓ should respect enclosing .gitignore (569ms)
 7    should teardown env after timeout:
 8    should respect excluded tests:
 9  ✓ should handle env beforeEach error (638ms)
10    should respect enclosing .gitignore:
```

외에도 실행 결과를 html 마크업으로 보기 좋게 내보내는 ‘html’ 옵션, 테스트 상태를 기호로 표현하는 ‘dot’ 옵션 등 여러 리포터를 제공하며, 각각의 리포터의 세부 설정도 조작 가능합니다. 이는 [Reporters 공식 문서](https://playwright.dev/docs/test-reporters)를 참조해 보세요.

크루루 팀은 QA 작업에 백엔드와 프론트엔드 구분 없이 모두가 참여해왔기 때문에, **E2E 테스트 결과를 팀원들이 쉽게 확인할 수 있는 공유 수단이 필요했습니다**. 이를 위해 Slack 채널에 테스트 결과를 자동으로 전송하는 **Custom Reporter**를 제작했습니다. 해당 리포터는 일상적인 E2E 테스트 작성 시에는 필요하지 않기 때문에, 일반적으로는 `list`와 `html` 리포터만을 사용하고 있습니다.

- custom reporter (`e2e/slack-reporter`)
    
    ```tsx
    import type { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
    import path from 'path';
    
    const getSlackMessage = ({
      all,
      passed,
      failed,
      skipped,
      duration,
      result,
    }) => (
    	// ...slack block kit
    );
    
    class MyReporter implements Reporter {
      all = 0;
    
      passed = 0;
    
      failed = 0;
    
      skipped = 0;
    
      failsMessage = '';
    
      onBegin(_: FullConfig, suite: Suite) {
        this.all = suite.allTests().length;
      }
    
      onTestEnd(test: TestCase, result: TestResult) {
        const testDuration = `${(result.duration / 1000).toFixed(1)}s`;
        const fileName = path.basename(test.location.file);
        const testTitle = test.title;
    
        switch (result.status) {
          case 'failed':
          case 'timedOut':
            this.addFailMessage(
              `✘ ${fileName}:${test.location.line}:${test.location.column} › ${testTitle} (${testDuration})`,
            );
            this.failed += 1;
            break;
          case 'skipped':
            this.addFailMessage(
              `⚠️ ${fileName}:${test.location.line}:${test.location.column} › ${testTitle} (${testDuration})`,
            );
            this.skipped += 1;
            break;
          case 'passed':
            this.passed += 1;
            break;
          default:
            break;
        }
      }
    
      async onEnd(result: FullResult) {
        const blockKit = await this.getBlockKit(result);
        const webhookUrl = await process.env.SLACK_WEBHOOK_URL;
    
        if (!webhookUrl) {
          console.error('SLACK_WEBHOOK_URL 환경 변수가 설정되지 않았습니다.');
          return;
        }
    
        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(blockKit),
          });
    
          if (!response.ok) {
            console.error('Slack 메시지 전송 실패:', response.statusText);
          } else {
            console.log('Slack 메시지 전송 성공');
          }
        } catch (error) {
          console.error('Slack 메시지 전송 중 에러 발생:', error);
        }
      }
    
      private addFailMessage(message: string) {
        this.failsMessage += `\n${message}`;
      }
    
      private async getBlockKit(result: FullResult) {
        const { duration } = result;
    
        const resultBlockKit = getSlackMessage({
          all: `${this.all}`,
          passed: `${this.passed}개`,
          failed: `${this.failed}개`,
          skipped: `${this.skipped}개`,
          duration: `${(duration / 1000).toFixed(1)}s`,
          result: `${this.failsMessage ? `통과하지 못한 테스트\n${this.failsMessage}` : '👍 모든 테스트가 성공적으로 통과했습니다!'}`,
        });
    
        return resultBlockKit;
      }
    }
    export default MyReporter;
    
    ```
    

### 참고 자료

[How to Use the Playwright Reporter API to Create Custom Reports](https://medium.com/@eugenegronski/how-to-use-the-playwright-reporter-api-to-create-custom-reports-43de0e89cd3f)

---

## 짧은 사용 후기

QA 문서를 Playwright 테스트로 이관하는 작업은 시작 단계이지만, 몇 개의 테스트를 작성하면서 느낀 playwright의 장점과 아쉬운 점을 공유해보려 합니다.

### 👍 직관적인 API

Playwright는 기본적으로는 변수에 요소를 담고 요소의 결과를 확인하는 느낌이라 마치 HTML, JS로 웹 개발을 할 때 코드를 작성하는 것과 비슷하게 느껴집니다. 

이런 직관적인 API 덕분에 새로운 툴이지만 적응이 빠를 수 있었습니다.

### 👍 유용한 VS Code 익스텐션

Playwright는 마이크로소프트에서 만든 만큼 테스트를 실행&디버깅 할 수 있는 익스텐션을 제공합니다. 사실 큰 기대를 하지 않았는데 유용함을 느꼈습니다. playwright를 사용한다면 꼭 설치해보길 추천합니다. 익스텐션으로 아래의 기능을 실행할 수 있습니다.

- **관심 있는 테스트만 별도 실행**
  테스트의 구조와 함께 각각의 테스트를 실행/디버깅 할 수 있는 버튼이 제공됩니다. 관심 있는 테스트만 별도로 실행/디버깅 할 수 있어 유용했습니다.
  
  ![](/posts/Playwright-도입기/image-02.webp)


- **편한 디버깅**
    테스트 코드에 브레이크 포인트를 찍어 디버깅을 할 수 있습니다. 이때 테스트용 브라우저창이 함께 열려 코드의 진행에 따른 UI 변화도 함께 볼 수 있다는 특징이 있습니다.
    
<br/>

- **Projects 선택**
    익스텐션의 Projects에서 내가 관심 있는 브라우저만을 선택해서 테스트할 수 있습니다. 앞서서 config 파일에 Projects를 여러 개 추가했다면 추가한 개수에 비례해 실행되는 테스트가 늘어납니다. 하지만 테스트 코드를 한창 작성할 때는 굳이 모든 브라우저를 테스트할 필요가 없으니 익스텐션에서 프로젝트를 선택하는 걸 추천합니다.
    
![](/posts/Playwright-도입기/image-03.webp)

### 🤔 긴 빌드 시간
병렬 테스트 실행으로 테스트 실행 시간은 짧지만, 새로 작성한 테스트가 처음으로 빌드될 때 그 시간이 오래 걸리는 편입니다. 

아직 테스트 개수가 그렇게 많지 않아 불편한 수준은 아니라 더 관찰이 필요합니다.


<br/>

---


## 총평
 
많은 기능이 무료로 제공되는 점도 좋았고, 무엇보다 직관적인 api와 유용한 익스텐션 덕에 테스트를 작성하고 실행하는 경험이 좋았습니다.

긴 시간 e2e 테스트에서 많은 영향력을 발휘해오던 cypress를 역전하고 playwright가 대세인 이유를 조금이나마 이해할 수 있었던 시간이었습니다.

아직은 playwright로 팀의 생산성을 끌어 올렸다고 말하기 민망한 수준의 몇 안되는 테스트만 존재하지만, 꾸준히 사용해본 뒤 글을 업데이트 해보겠습니다.
