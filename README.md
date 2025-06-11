<div align="center">
  <img width="80" alt="Logo_REAL" src="https://github.com/user-attachments/assets/3dc13b9c-c793-44e9-9e02-713abeb15d2a" />
  <h1>⚾️ PlayUs Frontend</h1>
  <p><em>PlayUs 웹 서비스를 위한 React 기반 프론트엔드 리포지토리입니다</em></p>

  <p>
    <!-- Frontend Stack -->
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
    <img src="https://img.shields.io/badge/CSS%20Modules-264DE4?style=for-the-badge&logo=css3&logoColor=white" alt="CSS Modules"/>
  </p>

  <p>
    <img src="https://img.shields.io/badge/개발기간-2025.04~06-7B42BC?style=for-the-badge&logoColor=black" alt="개발기간"/>
  </p>

  <h2> 🛠️ Project Structure</h2>
</div>

<div>
  
  ```
PlayUs-FE/src/    # public 폴더 구조는 따로 명시하지 않음
├── components/           # 공통 UI 컴포넌트 및 CSS
│   ├── CasterbotButton/        # 챗봇 대화를 위한 버튼
│   ├── CustomCalendar/         # Calendar 라이브러리 커스텀 CSS
│   ├── DragNDrop/              # 경기 시뮬레이션 진행 시 사용되는 Drag & Drop 기능
│   ├── DummyData/              # DB 연결 전 임시 테스트용 더미 데이터
│   ├── Form/                   # 직관팟 작성 폼 컴포넌트
│   ├── GameCard/               # 일정 페이지 경기별 각 카드
│   └── GameLogData/            # 시뮬레이션 경기 로그 데이터 UI 컴포넌트
│   ├── Header/                 # 공통 헤더
│   ├── League/                 # 경기 일정 UI 컴포넌트
│   ├── MobileView/             # 공통 화면 구성 UI 컴포넌트
│   ├── Modal/                  # 공통 모달 UI 컴포넌트
│   ├── NavBar/                 # 공통 하단 내비게이션 바
│   ├── Post/                   # 게시글 목록 조회용 Item 컴포넌트
│   ├── TabNav/                 # 공통 탭바 UI 컴포넌트
│   ├── TeamTabNav/             # 선호팀 추가 및 관리용 탭바 UI 컴포넌트
├── pages/                # 페이지별 컴포넌트 및 CSS
│   └── Chatbot/                # 챗봇 대화 UI
│   ├── Community/              # 커뮤니티 메뉴 페이지 UI
│   ├── InitialProfile/         # 회원가입 페이지 UI
│   ├── League/                 # 경기 일정 및 시뮬레이션 메뉴 페이지 UI
│   ├── LiveMachDiary/          # 직관일지 메뉴 페이지 UI
│   ├── Login/                  # 최초 Splash 및 로그인 페이지 UI
│   ├── Main/                   # 메인 홈페이지 메뉴 UI
│   ├── Party/                  # 직관팟 메뉴 UI
│   ├── Profile/                # 사용자 프로필 메뉴 페이지 UI
├── routes/               # Hash Routing 전용 routepath
├── Test/                 # 시뮬레이션 테스트용 코드(미사용)
├── utils/                # 미노출 및 기능용 컴포넌트
├── jest.config.js        # 테스트 빌드 진행 시의 정의 코드
├── package.json          # 프로젝트 의존성 및 스크립트 설정
└── README.md             # 프로젝트 설명 문서
```
</div>

<div align="center" display="flex">

## 🚀 Setting Guide

### 1. Install Libraries

``` cmd 
npm install 
```

### 2. set .env file 
<p> 2-1. 프로젝트 폴더에서 .env 파일 생성
<p> 2-2. 팀 드라이브에서 '개발 -> PlayUs-FE -> env파일 인증 정보' 문서에 있는 Environment Variables를 'key=value' 의 형태로 삽입</p>
<p>ex)</p>

```javascript
REACT_APP_EXAMPLE_ENV=http://exampleurl:portnumber
```

### 3. Run NPM
``` cmd 
npm start
```

## 🔧 ERROR GUIDE
### 1. Library 충돌 시
<p> 1-1. node.modules 폴더 삭제</p>
<p> 1-2. terminal에서 npm install 재실행</p>

### 2. 개발 중 web network에서 mixed-tag 오류 발생 시
<p> 2-1. /public 폴더의 index.html 확인</p>
<p> 2-2. 해당 라인 확인 후 제거

  ``` html
  <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
 ``` 
</p>


  <h2>👨🏻‍💻 Contributors</h2>

| <img width="160px" src="https://avatars.githubusercontent.com/zsjon" /> | <img width="160px" src="https://avatars.githubusercontent.com/yangseohyun" /> |
|:---:|:---:|
| [조민성](https://github.com/zsjon) | [양서현](https://github.com/yangseohyun) |
| Front End (PL) | Front End |

</div>
