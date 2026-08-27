---
title: 'react-hook-form 톺아보기 - 어떻게 렌더링 성능을 개선했을까?'
description: 'react-hook-form이 폼 상태를 관리하면서 불필요한 렌더링을 줄이는 방식을 살펴보고, 프로젝트에 도입한 이유를 정리했습니다.'
pubDate: '2024-10-13'
updatedDate: '2026-05-18'
category: 'Frontend'
heroImage: '../../assets/posts/reac-hook-form-톺아보기1-어떻게-렌더링-성능을-개선했을까/thumbnail.webp'
---
## 들어가기 전에

저의 우테코 팀프로젝트인 크루루는 폼에 관한 다양한 요구사항이 있었는데요,

회원가입, 로그인 같은 일반적인 폼부터 사용자 입력에 따라 필드가 추가되는 폼, 서버에서 필드에 대한 데이터를 받아 동적으로 렌더링되는 폼 등 다양한 요구사항을 충족해야 했습니다.

![](/posts/reac-hook-form-톺아보기1-어떻게-렌더링-성능을-개선했을까/image-01.webp)

이를 하나의 훅으로 관리하기 위해 `react-hook-form`의 `useForm` API를 참고해 자체 훅을 만들었지만, 다양한 상황에 대응하기에는 확장성이 부족했습니다. 
결국 다른 중요한 기능 개발 일정으로 인해 해당 훅의 리팩토링을 중단하고 사용을 중지하게 되었습니다.🥲

이렇게 확실하게 실패하고 나니, 범용적인 솔루션을 만들어낸 `react-hook-form`의 비결이 무엇일까 궁금해져 `useForm`의 내부 구현을 분석하며 그 원리를 파악해보기 시작했습니다.

이번 포스팅에서는 react-hook-form이 Uncontrolled 방식을 선택한 이유와, **Uncontrolled 방식의 성능 이점**을 가져가면서도 **실시간으로 업데이트되는 formState를 어떻게 구현해냈는지**에 대해 살펴보겠습니다.

(참고: react-hook-form의 버전은 2024.10.16 기준 latest인 `7.53.0`입니다.

---

## 〰️ Controlled vs Uncontrolled

리액트로 폼을 다루는 방식엔 2가지 방식이 존재합니다.

**사용자의 입력을 상태로 관리하는 Controlled** 방식과, 별도의 상태를 관리하지 않고 **필요한 시점에 값만 가져오는 Uncontrolled** 방식이 그것입니다.

보통 사용자 입력에 따라 UI와 상태를 동기화시키는 Controlled 방식을 많이 사용하실텐데요, Controlled 방식은 상태를 직접 관리하기 때문에 입력에 따른 유효성 검사나 포맷팅을 구현하기도 수월합니다.

하지만 react-hook-form은 **Uncontrolled 방식**을 기본으로 합니다. 그 이유가 무엇일까요? 바로 성능 때문입니다.

> **Performance is one of the primary reasons why this library was created.** (…중략) This approach **reduces the amount of re-renderin**g that occurs due to a user typing in an input or other form values changing at the root of your form or applications.
[react-hook-form FAQs](https://react-hook-form.com/faqs)
> 

위의 FAQ에서도 말했듯, Controlled 방식은 값을 상태로 관리하기 때문에 리렌더링을 트리거합니다. 코드를 통해 살펴볼까요?

```tsx
import React, { useState } from 'react';

export default function ControlledForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const handleSubmit = () => {
	  e.preventDefault();
    console.log('제출: ', formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.username}
        onChange={handleChange}
      />

      <input
        value={formData.email}
        onChange={handleChange}
      />
        
// ...생략
```

위 코드처럼 폼의 상태를 하나의 `state`로 관리할 경우, `username` 입력만 변경하더라도 불변성 원칙에 따라 `formData` 전체가 업데이트됩니다. 따라서 폼 전체가 리렌더링되며, 불필요한 자원이 소모됩니다.

반면, Uncontrolled 방식은 상태를 사용하지 않고 DOM 요소를 `ref`로 참조하여, 제출 시점과 같이 필요할 때만 `ref.value`를 통해 값을 가져옵니다.

```tsx
import React, { useRef } from 'react';

export default function UncontrolledForm = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const username = usernameRef.current?.value;
    const email = emailRef.current?.value;

    console.log('제출: ', { username, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={usernameRef} />
      <input ref={emailRef} />
        
// ...생략

```

Uncontrolled 방식은 코드가 더 간결하고, 불필요한 리렌더링을 발생시키지 않아 효율적으로 보일 수 있습니다. 하지만 중요한 한계점이 있습니다. 

바로 입력값을 상태로 관리하지 않기 때문에, **실시간 유효성 검사나 값 변화에 따른 즉각적인 처리가 어렵다**는 점입니다.

Controlled 방식에 비해 Uncontrolled에서 구현하기 힘든 것들을 표로 살펴보면 다음과 같습니다.

| 기능 | Uncontrolled | Controlled |
| --- | --- | --- |
| 한 번만 값 가져오기 (예: 제출 시) | ✅ | ✅ |
| 제출 시 유효성 검사 | ✅ | ✅ |
| 즉각적인 필드 유효성 검사 | ❌ | ✅ |
| 조건에 따른 제출 버튼 비활성화 | ❌ | ✅ |
| 입력 형식 강제 | ❌ | ✅ |
| 하나의 데이터에 여러 입력 사용 | ❌ | ✅ |
| 동적인 입력 처리 | ❌ | ✅ |

하지만 react-hook-form은 Uncontrolled에서 불가능하다고 언급된 대부분의 기능을 구현할 수 있습니다. 오늘은 그 중에서도 form의 상태를 관리하는 formState에 대해서 알아보고, 나머지 내용은 이어지는 포스팅에서 다루겠습니다.

---

## 〰️ `formState`

`formState`는 이름처럼 **폼의 상태를 관리하는 상태(state)**입니다. `formState`에서 관리하는 값들은 다음과 같습니다.

```tsx
export type FormState<TFieldValues extends FieldValues> = {
  isDirty: boolean;
  isLoading: boolean;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  disabled: boolean;
  submitCount: number;
  defaultValues?: undefined | Readonly<DeepPartial<TFieldValues>>;
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
  touchedFields: Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
  validatingFields: Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
  errors: FieldErrors<TFieldValues>;
};
```

`‘조건에 따른 제출 버튼 비활성화’`의 조건을 값이 수정되었는지 여부로 설정한다면, `formState`의 `isDirty` 필드를 사용할 수 있습니다. 

```tsx
const { formState: isDirty } = useForm({ ... })
```

그런데 조금 이상하지 않나요? `formState`를 상태로 관리한다면, 하나의 상태만 바뀌어도 저 많은 값들이 새로 계산되어 불필요한 리렌더링이 촉발되어야 하지 않을까요?

<br/>

### 주요 패턴(1) - Proxy Pattern

react-hook-form에서는 **Proxy를 이용해 사용자가 실제로 참조하고 있는 필드만 업데이트**됩니다. 그것도 필요한 때에요.

> #### 💡 **Proxy란?**
> Proxy는 객체에 대한 작업(예: 속성 접근, 값 설정 등)을 가로채는 것을 의미합니다.
> Proxy는 두 가지 요소로 구성됩니다:
> - **타겟 객체(target)**: Proxy로 감쌀 실제 객체
> - **핸들러(handler)**: 객체의 동작을 가로채는 함수들이 들어 있는 객체. 각 동작에 대해 트랩(trap)을 설정할 수 있습니다.

내부 코드를 살펴보면서 더 자세히 알아보겠습니다.

아래 코드를 살펴보면서 큰 흐름을 잡겠습니다.
- `formState`를 **상태로 선언하고**, 
- 이를 `getProxyFormState` 함수에서 **어떤 처리**를 한 뒤,
- `_formControl`라는 `ref` 객체에 담아 반환합니다. 

(useSubscribe는 잠시 넘어가주세요.)


```tsx
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  props: UseFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
	// useForm의 반환값이 모두 담겨있는 ref 객체입니다.
  const _formControl = React.useRef<
    UseFormReturn<TFieldValues, TContext, TTransformedValues> | undefined
  >();
  // formState 상태입니다.
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>({
    // ... initialize
  });
  
  const control = _formControl.current.control;
  control._options = props;
  
  useSubscribe({
    subject: control._subjects.state,
    next: (
      value: Partial<FormState<TFieldValues>> & { name?: InternalFieldName },
    ) => {
      if (
        shouldRenderFormState(
          value,
          control._proxyFormState,
          control._updateFormState,
          true,
        )
      ) {
        updateFormState({ ...control._formState });
      }
    },
  });

	// 상태로 관리되는 formState를 getProxyFormState를 실행시켜 ref 객체에 담습니다.
  _formControl.current.formState = getProxyFormState(formState, control);

  return _formControl.current;
}
```

<br/>

Proxy 패턴을 사용한 만큼 가장 중요한 함수는 `getProxyFormState`일 것 같습니다. 함수 이름으로 유추해보자면 formState의 proxy 객체를 반환해주는 것으로 보이는데요, 이를 어떻게 구현했는지 `getProxyFormState` 안으로 들어가봅시다.

`getProxyFormState` 함수의 역할은 간단합니다. `formState`를 받아 **getter를 재정의**한 뒤 proxy로 감싸진 `proxyFormState`를 반환합니다.

재정의된 getter는 `_control` 객체의 `VALIDATION_MODE`를 ‘all’로 변경합니다. 
이렇게 함으로써 사용자가 `formState`의 특정 필드를 참조하면 재정의된 getter가 실행되어 `_proxyFormState`에 있는 해당 필드의 VALIDATION_MODE가 'all'이 됩니다.

```tsx
export default <TFieldValues extends FieldValues, TContext = any>(
  formState: FormState<TFieldValues>,
  control: Control<TFieldValues, TContext>,
	localProxyFormState?: ReadFormState,
  isRoot = true,
) => {
	const result = {
    defaultValues: control._defaultValues,
  } as typeof formState;
	
  for (const key in formState) {
	  // getter를 재정의
    Object.defineProperty(result, key, {
      get: () => {
        const _key = key as keyof FormState<TFieldValues> & keyof ReadFormState;

        // 특정 상태가 구독되고 있을 때만 'all'로 설정해
        // 해당 상태의 모든 변화를 감지하도록 함.
        // shouldRenderFormState의 동작과 합쳐져 결과적으로 필요할 때만 리렌더링이 발생함.
        if (control._proxyFormState[_key] !== VALIDATION_MODE.all) {
          control._proxyFormState[_key] = !isRoot || VALIDATION_MODE.all;
        }

        localProxyFormState && (localProxyFormState[_key] = true);

        return formState[_key];
      },
    });
  }

  return result;
};
```

<br/>

### 주요 패턴(2) - Observer Pattern

위에서 잠시 넘어갔던 `useSubscribe`를 기억하시나요? 

아래 코드는 ref에 저장된 `_proxyFormState`가 리렌더링을 트리거할 수 있도록 하는 핵심 코드입니다.

- `useSubscribe`를 통해 `control._subjects.state`라는 폼 상태를 구독합니다.
- 상태가 변경될 때마다 `next` 콜백을 실행하여 폼의 상태가 업데이트되었는지 확인합니다. 
- 폼 상태가 **리렌더링을 요구하는 변화**라면, `updateFormState`를 호출하여 **현재 상태를 UI에 반영**하게 됩니다.

```tsx
useSubscribe({
    subject: control._subjects.state,
    next: (
      value: Partial<FormState<TFieldValues>> & { name?: InternalFieldName },
    ) => {
      if (
	      // 리렌더링이 필요한지 여부를 반환
        shouldRenderFormState(
          value,
          control._proxyFormState,
          control._updateFormState,
          true,
        )
      ) {
        updateFormState({ ...control._formState });
      }
    },
  });
```

<br/>

위 코드에서 가장 중요한 부분이 `shouldRenderFormState` 함수겠네요. 다시 코드를 타고 들어가봅니다.(거의 다왔습니다!)


`shouldRenderFormState`에서는 아래의 경우 **리렌더링이 필요하다고 판단**합니다.
- 상태가 비어 있는 경우
- 구독된 상태 중 변경이 있는 경우
- 전체 검증(`VALIDATION_MODE.all`)이 활성화된 경우

```tsx
export default <T extends FieldValues, K extends ReadFormState>(
  formStateData: Partial<FormState<T>> & { name?: InternalFieldName },
  _proxyFormState: K,
  updateFormState: Control<T>['_updateFormState'], //_updateFormState: (formState: Partial<FormState<TFieldValues>>) => void;
  isRoot?: boolean,
) => {
  updateFormState(formStateData);
  const { name, ...formState } = formState;
  
  return (
    isEmptyObject(formState) ||
    // formState의 필드 수가 구독 중인 필드 수보다 크거나 같은 경우 true 반환 (리렌더링 필요)
    Object.keys(formState).length >= Object.keys(_proxyFormState).length ||
    // formState에서 구독된 필드 중 VALIDATION_MODE.all로 설정된 필드가 있는지 여부를 반환 (있다면 리렌더링 필요)
    Object.keys(formState).find(
      (key) =>
        _proxyFormState[key as keyof ReadFormState] ===
        (!isRoot || VALIDATION_MODE.all),
    )
  );
};

```

위에서 getter를 재정의해 `VALIDATION_MODE`를 all로 변경하는 로직을 삽입한 것을 확인했었죠. 
바로 이 두 함수의 동작이 합쳐지면서 개발자가 사용하고 있는 formState만 업데이트해 효율적으로 렌더링하는 것이 가능해진 것입니다.

<br/>

---

## 정리하기

`react-hook-form`은 Uncontrolled 방식을 기본으로 하면서도 Controlled 방식에서 가능한 실시간 상태 관리의 이점을 포기하지 않았습니다. 

이를 가능하게 한 중요한 요소 중 하나가 바로 `Proxy`와 상태 구독`useSubscribe` 메커니즘입니다. 

이러한 구조 덕분에 **필요한 부분만 렌더링**되며 성능을 최적화할 수 있었고, 사용자 경험을 해치지 않으면서도 대규모 폼을 관리할 수 있었습니다.

다음 포스팅에서는 `react-hook-form`이 제공하는 또 다른 중요한 기능을 다루어보겠습니다. 끝까지 읽어주셔서 감사합니다!
