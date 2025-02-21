# Another Office Clone

Next.js 13과 Prisma를 활용한 의류 쇼핑몰 프로젝트입니다. (Another Office 클론코딩)

## 기술 스택

### Frontend

- Next.js 13 (App Router)
- TypeScript
- NextUI
- TailwindCSS
- Next-Auth

### Backend

- Prisma
- SQLite

## 주요 기능

### 사용자

- 제품 목록 조회 및 상세 보기
- 컬러/사이즈 선택
- 장바구니
- 위시리스트
- 주문 및 결제
- 회원가입/로그인

### 관리자

- 제품 등록/수정/삭제
- 재고 관리
- 주문 관리
- 회원 관리

## 데이터 모델

### Product (제품)

- 기본 정보 (이름, 설명, 가격 등)
- 카테고리 및 성별
- 컬러/사이즈 variants
- 이미지 (착용, 제품, 추가 이미지)

### ProductVariant (제품 변형)

- 사이즈
- 컬러
- 재고
- 이미지

### User (사용자)

- 기본 정보
- 장바구니
- 위시리스트
- 주문 내역

## 프로젝트 구조

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
