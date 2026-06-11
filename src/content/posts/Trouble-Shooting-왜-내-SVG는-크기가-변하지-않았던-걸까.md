---
title: 'Trouble Shooting: 왜 내 SVG는 크기가 변하지 않았던 걸까?'
description: 'SVG 아이콘 크기가 예상대로 바뀌지 않았던 문제를 추적하며 viewBox, 좌표계, wrapper 구조를 중심으로 원인을 정리했습니다.'
pubDate: '2025-07-06'
updatedDate: '2026-06-08'
category: 'Other'
heroImage: '../../assets/posts/Trouble-Shooting-왜-내-SVG는-크기가-변하지-않았던-걸까/thumbnail.webp'
---
## 🤔 왜 내 SVG는 크기가 변하지 않았던 걸까?

어느 수요일 5시.. 신규 게시판을 메뉴 탭에 추가해달라는 요청을 받았습니다. 

처음 해보는 작업이었지만 기존 코드를 보니 아이콘만 추가하면 되는 간단한 작업으로 보였습니다. 그래서 QA 담당자에게 ‘10분 정도면 작업 할 수 있어요’ 라고 말을 했습니다. 그땐 이 간단한 작업으로 저녁을 놓칠 거란 생각은 못했죠..

기존에 추가되어 있던 아이콘들을 보니, 공통적으로 IconWrapper로 감싸져 있었습니다. 이 IconWrapper는 기본 스타일을 자동으로 넣어주면서 svg의 크기와 굵기를 동적으로 조절할 수 있게 해주는 컴포넌트입니다. 거의 모든 Icon이 이 wrapper에 감싸져 있었기 때문에 ‘컨벤션이구나’ 생각하며 사용했습니다.

```tsx
import { IconThickness, IconWrapper } from '@repo/5x';

interface Props {
  size?: number;
  thickness?: IconThickness;
}

export const IconCommunityGoal = ({ size = 20, thickness }: Props) => {
  return (
    <IconWrapper size={size} thickness={thickness}>
      {/** svg 내용 */}
    </IconWrapper>
  );
};

/** IconWrapper (간략) */
export const IconWrapper = ({
  size,
  children,
  viewBox = '0 0 24 24',
  ...rest
}: IconProps) => {
  return (
    <i
      className={/** 공통 스타일*/}
      style={/** size 전달 */}
      {...rest}>
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        fill="none">
        {children}
      </svg>
    </i>
  );
};
```

 그리고 메뉴 별로 아이콘의 크기가 잘 바뀌는지 확인하려는 순간.. 

![왜 크기가 안 바뀌지?](/posts/Trouble-Shooting-왜-내-SVG는-크기가-변하지-않았던-걸까/image-01.webp)
크기가 이상합니다.

size prop을 디버깅해보니 숫자 28이 분명 전달되고 있는데도, 아이콘의 크기는 바뀌지 않았습니다. 왜 그랬을까요? 원인은 바로 SVG가 그림을 그리는 방식에 있었습니다.

## SVG가 크기와 단위를 처리하는 방법

SVG는 좌표계를 사용해 그림을 그립니다. 문서의 왼쪽 위 모서리는 (0, 0)으로, X축 양의 방향은 오른쪽, Y축 양의 방향은 아래쪽으로 향합니다. HTML의 요소가 배치되는 것과 같은 방식입니다.

![](/posts/Trouble-Shooting-왜-내-SVG는-크기가-변하지-않았던-걸까/image-02.webp)

```html
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="200" height="200">
  <circle cx="100" cy="100" r="100" fill="red" />
</svg>
```

svg에서 별도 단위를 명시하지 않으면 크기는 출력 장치(화면)의 1px을 따릅니다.

즉, 위 코드는 가로 200px, 세로 200px의 뷰포트에서 x 방향으로 100px, y 방향으로 100px 떨어진 곳에 위치한 빨간색 원을 그리는 것입니다.

![](/posts/Trouble-Shooting-왜-내-SVG는-크기가-변하지-않았던-걸까/image-03.webp)

하지만 width를 100, height을 100으로 줄이면 어떻게 될까요?

```html
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100">
  <circle cx="100" cy="100" r="100" fill="red" />
</svg>
```

원이 잘려서 일부만 보이게 됩니다. 왜냐하면 SVG는 내부 도형이 어떤 좌표계를 기준으로 그려졌는지 모른 채, 외부에서 정해준 크기만으로 화면에 출력하기 때문입니다.

![](/posts/Trouble-Shooting-왜-내-SVG는-크기가-변하지-않았던-걸까/image-04.webp)


이때 필요한 것이 바로 viewBox입니다.

## viewBox

viewBox는 SVG 내부에 가상의 좌표 공간을 정의하고, 이 공간을 실제 출력 크기(width, height)에 맞게 자동으로 확대 또는 축소해줍니다. 

내부 도형은 이 가상 공간을 기준으로 그려지고, 브라우저는 이를 적절히 스케일링해서 화면에 보여줍니다.

```html
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 200 200" width="100" height="100">
  <circle cx="100" cy="100" r="100" fill="red" />
</svg>
```

즉, 이 경우 `viewBox="0 0 200 200"` 덕분에 브라우저는 다음과 같이 판단할 수 있게 됩니다

> 아, **내부 도형**들은 원래 **200x200 좌표계 기준**으로 그려졌구나.
그런데 뷰포트 크기는 `width=100`, `height=100`이라고 했네?
그럼 이걸 100x100 크기에 맞춰서 **비율을 유지한 채 축소해서** 보여줄게!
> 

그 결과, 원의 비율이 유지된 채 **100px × 100px 크기 안에 맞춰 전체가 잘리지 않고 깔끔하게** 보이게 됩니다.

![](/posts/Trouble-Shooting-왜-내-SVG는-크기가-변하지-않았던-걸까/image-05.webp)


## IconWrapper로 돌아와서..

이제 IconWrapper 코드로 돌아가 보면, 왜 아이콘의 크기가 변하지 않았는지 그 이유가 분명해집니다.

바로 `viewBox`가 `'0 0 24 24'`로 **고정되어 있었기 때문**입니다.

```tsx
export const IconWrapper = ({
  size,
  children,
  viewBox = '0 0 24 24',
  ...rest
}: IconProps) => {
  return (
    <i
      className={/** 공통 스타일*/}
      style={/** size 전달 */}
      {...rest}>
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        fill="none">
        {children}
      </svg>
    </i>
  );
};
```

제가 추가하려던 아이콘의 원본 `viewBox`는 `"0 0 20 20"`이었습니다. 그런데 `IconWrapper`에서 `"0 0 24 24"`라는 좌표계로 **강제로 바꾸어버리니**, 내부 도형의 비율이 원래 설계된 방식과 달라졌고, 이로 인해 **사이즈 계산이 어긋나고 아이콘이 커지거나 작아지지 않는** 문제가 발생했던 것입니다.

즉, 아이콘 자체는 `size` 값을 받아도, 내부 도형이 **24x24 공간 기준으로 스케일링**되다 보니, 실제로는 크기가 변하지 않는 것처럼 보였던 거죠.

---

이 트러블 슈팅으로 svg의 Scalibility를 보장해주는 핵심 요소가 viewBox라는 사실을 알게될 수 있었습니다.

~~또한 “10분이면 돼요”라는 말은 신중해야 한다는 것도요..~~

### 참고자료

[SVG 튜토리얼 - SVG: Scalable Vector Graphics | MDN](https://developer.mozilla.org/ko/docs/Web/SVG/Tutorials/SVG_from_scratch)

[SVG 뷰포트(viewport)와 뷰박스(viewBox) - Puterism](https://puterism.com/svg-viewport-and-viewbox/)
