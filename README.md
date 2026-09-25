<p align="center">
    <img src="https://github.com/geonganghaegym/geonganghaegym-web/assets/102174146/f0629a08-f862-4b67-bf93-d52df57acb79" alt="건강해짐 로고 이미지" >
    <br />
    <h1 align="center">건강해짐</h1>
    <p align="center">피트니스 센터, 트레이너와 회원을 위한 일정 관리 앱</p>
    <br />
    <p align="center">
      <a href="https://geonganghaejim.site/">웹 사이트</a>
<!--       .
      <a href="#">App</a> -->
    </p align="center">
</p>

<br />

## 서비스 개요

![건강해짐 배너 sns](https://github.com/geonganghaegym/geonganghaegym-web/assets/102174146/d1682aea-4a3e-4c3e-84fc-9c55b3626547)

### PT 스케줄 관리

![건강해짐 배너 sns (1)](https://github.com/geonganghaegym/geonganghaegym-web/assets/102174146/96784978-d903-47bf-832d-8433da311ae8)

아직도 트레이너가 수기로 일정을 메모하고 카카오톡 메신저로 회원 관리를 하나요?

건강해짐을 사용하면 트레이너는 헬스장 회원 스케줄 관리를 편하게 할 수 있어요.

헬스장 회원도 미리 트레이너 스케줄을 확인하고 등록할 수 있어요.

<br />

### 체계적인 회원 관리

![건강해짐 배너 sns (3)](https://github.com/geonganghaegym/geonganghaegym-web/assets/102174146/05e70f40-4c75-4349-bfaa-fedc69cbc923)

스케줄 관리 뿐만 아니라 헬스장 회원에 대한 체계적인 관리도 가능해요.

회원에 대한 나만의 메모장, PT 피드백 그리고 수강권 관리까지!

좀 더 세심하게 회원을 관리할 수 있어요.

<br />

## 실행 방법

### Production

[운영 환경](https://geonganghaejim.site/)

### 테스트계정

> 학생 계정 : healthy-student0 / 12345678a

> 트레이너 계정 : healthy-trainer0 / 12345678a

### Local

```
git clone https://github.com/geonganghaegym/geonganghaegym-web.git

cd geonganghaegym-web
npm i
npm run dev
```

<br />

## 프론트엔드

### 기술 스택

- Next.js
- shadcn-ui(radix ui + tailwind css + cva)
- zustand, tanstack-query, axios,
- PWA, FCM(Firebase Cloud Messaging)

### 인프라

.

### 프로젝트 구조

<img width="187" alt="image" src="https://github.com/geonganghaegym/geonganghaegym-web/assets/102174146/3258f939-5113-4eef-85c0-907da1630b39">

<br />

FSD 아키텍처를 적용하여 책임 크기 단위로 계층을 분리하고, 기능 단위로 폴더를 나누었습니다.

코드의 복잡성이 증가함에 따라 발생할 수 있는 컴포넌트 간 순환 참조 발생 가능성을 크게 낮추었고, 코드를 분리하는 기준을 좀 더 명시적으로 정하여 협업할 수 있었습니다.

FSD 아키텍처의 app layer의 컨셉과 Next.js app router의 기능 간의 개념적인 충돌이 있었지만, 프로젝트 특성에 맞도록 최적화하여 구성했습니다.

###
