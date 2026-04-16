# 📚 광주 광역사고조사센터 프로젝트 통합 기술 지침서

본 문서는 프로젝트의 지속 가능성과 일관된 품질 유지를 위해 디자인, 시스템 구성, 코딩 방법론, 비즈니스 로직을 상세히 정의합니다.

---

## 🎨 1. 디자인 가이드라인 (Design & Aesthetics)
### 1.1 컬러 및 톤 (Color Palette)
- **Primary**: `#0047A0` (신뢰감 있는 다크 블루)
- **Secondary**: `#2E7D32` (안전을 상징하는 그린)
- **Accent**: `#E63946` (긴급 상황을 알리는 레드)
- **Background**: `#F8FAFC`, `#FFFFFF`
- **Glassmorphism**: `rgba(255, 255, 255, 0.9)`, `backdrop-filter: blur(10px)` (고급스러운 카드 배경)

### 1.2 타이포그래피 (Typography)
- **폰트**: 'Noto Sans KR' (Google Fonts)
- **굵기**: 제목(700~900), 본문(400~500), 보조텍스트(300)
- **자간/행간**: `letter-spacing: -0.5px`, `line-height: 1.6`

### 1.3 여백 및 수치 (Spacing & Metrics)
- **안전 마진(Safe Margin)**: 
    - **PC 기준**: 화면 양 끝단에 최소 `40px` 이상의 Padding을 확보하여 광활한 안정감을 준다.
    - **모바일 기준(768px 이하)**: 패딩을 `15px`로 축소하여 화면 잘림을 방지하고 가로 공간을 최대한 확보한다.
- **컴포넌트 곡률**: `border-radius: 12px` 또는 `50px`(버튼/검색창) 통일.
- **그림자**: `box-shadow: 0 10px 30px rgba(0,0,0,0.05)` 활용.

---

## 🏗️ 2. 시스템 구성도 (System Composition)
### 2.1 파일 구조
- `index.html`: 메인 대시보드 및 실시간 중대재해속보.
- `notice.html`, `library.html`, `qna.html`: 게시판형 서비스.
- `center-intro.html`, `disasters.html`: 정보 제공 및 특화 데이터 연동.
- `style.css`: 전체 전역 스타일 및 반응형 정의.
- `script.js`: GNB 네비게이션, 모바일 메뉴, 공통 UI 로직.
- `disasters-script.js`: 중대재해 DB CRUD 및 필터링 특화 로직.

### 2.2 반응형 체계
- **PC**: 1500px 이하 유동 레이아웃.
- **Mobile Breakpoint**: `768px` (GNB가 햄버거 메뉴로 전환되는 기준점).

---

## 💻 3. 코딩 표준 및 방식 (Coding Methods)
- **바닐라 지성**: 외부 프레임워크 없이 순수 HTML/CSS/JS를 사용하여 경량화 및 가독성을 유지한다.
- **이벤트 핸들링**: `window.addEventListener('DOMContentLoaded', ...)` 내부에서 로직을 시작하여 DOM 로드 오류를 방지한다.
- **리소스 호출**: 
    - `style.css?v=XX`, `script.js?v=XX` 와 같이 수동 버전 파라미터를 사용하여 배포 시 캐시를 즉시 갱신한다.
    - 로컬 호스트 테스트를 위해 내부 링크는 절대 `/path` 형식이 아닌 `filename.html` 형식을 유지한다.

---

## ⚙️ 4. 비즈니스 로직 (Core Business Logic)
### 4.1 데이터 연동 (Supabase Integration)
- **CRUD 원칙**: `async/await` 패턴을 사용하여 네트워크 지연 시 사용자에게 로딩 상태(`loading-spinner`)를 명확히 보여준다.
- **지연 로딩**: `pageSize`와 `currentPage`를 활용한 페이징 처리로 대량 데이터 노출 시 성능을 확보한다.

### 4.2 지역 데이터 매핑 (Data Matching)
- **유연한 검색**: 데이터베이스의 '광주'와 '광주광역시'를 동일한 지역으로 간주하여 `or` 필터를 통해 병합 조회한다.
- **코드 예시**: `if (r === '광주') { dbRegions.push('광주', '광주광역시'); }`

### 4.3 보안 및 관리
- **관리자 모드**: 
    - 비밀번호 `3151` 일치 시 브라우저 세션에 관리자 권한을 부여한다.
    - 권한 활성화 시 각 카드 하단에 '삭제' 버튼, 상단에 '사례 등록' 버튼이 동적으로 렌더링된다.

### 4.4 기간 필터 UI 로직 (Period Toggle)
- **프리셋 모드**: '최근 1개월', '최근 1년' 등 선택 시 날짜 입력창을 숨기고(`internal logic`) 즉시 자동 조회를 수행한다.
- **커스텀 모드**: 드롭다운에서 '직접 입력'을 선택한 경우에만 날짜 선택창(`filterDatesWrapper`)을 노출하여 사용자 경험을 최적화한다.


---

## 🔄 5. 작업 프로세스 (Standard Workflow)
1. **[연구]** 사용자 요구사항에 대한 코멘트 및 환경(로컬/배포) 분석.
2. **[로컬 수정]** 변경 사항을 로컬 파일에만 적용.
3. **[사용자 검증]** 사용자에게 `localhost:3000`에서 확인을 요청함.
4. **[피드백 반영]** 사용자의 수정 요청이나 지적을 규칙 파일에 먼저 기록 후 반영.
5. **[최종 배포]** 사용자의 명시적 "배포" 지시가 있을 때만 `git push` 실행.
