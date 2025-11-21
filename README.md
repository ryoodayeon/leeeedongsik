# 시간이 금이다 - 콜렉티브 이동식 웹사이트

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 서버 실행
```bash
npm start
```

또는 개발 모드 (nodemon 사용):
```bash
npm run dev
```

서버는 `http://localhost:3000`에서 실행됩니다.

## 프로젝트 구조

- `index.html` - SPA 메인 페이지 (모든 페이지 포함)
- `server.js` - Express 백엔드 서버
- `database.sqlite` - SQLite 데이터베이스 (자동 생성)
- `css/style.css` - 스타일시트
- `js/app.js` - 프론트엔드 JavaScript
- `js/resume-data.js` - 이력서 데이터

## 기능

### 1. 페이지 구조
- **홈**: 시금제 소개
- **시금제 메뉴얼**: 상세 매뉴얼
- **시금쿠폰 발급 현황**: 발급목록/수행목록 탭으로 구성
- **콜렉티브 이동식 이력서**: 팀 이력 및 개인 이력서 (이름 클릭 시 상세 보기)

### 2. 쿠폰 관리 기능
- 발급목록/수행목록 조회
- 쿠폰 추가
- 쿠폰 수정
- 쿠폰 삭제

### 3. API 엔드포인트

#### 발급목록
- `GET /api/coupons/issued` - 전체 조회
- `GET /api/coupons/issued/:id` - 단일 조회
- `POST /api/coupons/issued` - 추가
- `PUT /api/coupons/issued/:id` - 수정
- `DELETE /api/coupons/issued/:id` - 삭제

#### 수행목록
- `GET /api/coupons/completed` - 전체 조회
- `GET /api/coupons/completed/:id` - 단일 조회
- `POST /api/coupons/completed` - 추가
- `PUT /api/coupons/completed/:id` - 수정
- `DELETE /api/coupons/completed/:id` - 삭제

## 배포

### 로컬 네트워크에서 다른 기기 접근
1. 서버 실행 시 `0.0.0.0`으로 바인딩 (기본값: localhost만 접근 가능)
2. 같은 네트워크의 다른 기기에서 `http://[서버IP]:3000` 접근

### 프로덕션 배포 (외부 접근)
1. **호스팅 서비스 사용** (추천):
   - Heroku, Railway, Render, Vercel 등
   - 서버와 프론트엔드를 함께 배포
   - 자동으로 HTTPS 제공

2. **수동 배포**:
   - 서버를 VPS나 클라우드 서버에 배포
   - 도메인 연결 (선택사항)
   - `js/app.js`의 `API_BASE_URL`이 자동으로 현재 호스트를 사용하도록 설정됨

3. **환경 변수 설정**:
   ```bash
   PORT=3000 npm start
   ```

### 현재 설정
- **개발 환경**: `localhost` 또는 `127.0.0.1`에서 접근 시 → `http://localhost:3000/api` 사용
- **프로덕션 환경**: 다른 호스트에서 접근 시 → 현재 호스트의 `/api` 사용

### 주의사항
- 배포 시 서버가 실제 호스트에서 실행되어야 함
- CORS 설정이 모든 origin을 허용하도록 설정되어 있음 (개발용)
- 프로덕션에서는 특정 도메인만 허용하도록 CORS 설정 변경 권장

