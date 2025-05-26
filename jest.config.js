module.exports = {
    moduleNameMapper: {
      // CSS, SCSS 등 스타일 파일은 가짜 객체로 처리
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

      // 이미지 등 정적 파일은 파일 모의(Mock)로 처리
      '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
  
    // 브라우저 환경을 흉내 내는 jsdom을 사용
    testEnvironment: 'jsdom',
  
    // 모듈을 불러올 때 node_modules 외에도 src 폴더 기준으로도 import 가능하게 설정
    moduleDirectories: ['node_modules', 'src'],
  
    // 기본적으로 node_modules 내부는 Babel 변환을 하지 않지만, 특정 ES 모듈 라이브러리는 변환 대상으로 포함
    transformIgnorePatterns: [
      'node_modules/(?!react-router-dom|@testing-library/react|@testing-library/jest-dom|axios)'
    ],
  };
