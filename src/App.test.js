import { render, screen } from '@testing-library/react';
import AppRouter from './routes/AppRouter';
import React from 'react';

describe('AppRouter', () => {
  test('스플래시 페이지가 기본 경로(/)에서 렌더링됩니다', () => {
    render(<AppRouter />);
    // Splash 페이지의 로고 이미지가 있는지 확인
    expect(screen.getByAltText('PlayUs 로고')).toBeInTheDocument();
  });

  test('로그인 페이지가 /login 경로에서 렌더링됩니다', () => {
    // HashRouter를 사용하므로 #을 포함한 경로로 테스트
    window.location.hash = '#/login';
    render(<AppRouter />);
    // Login 페이지의 환영 메시지가 있는지 확인
    expect(screen.getByText('플레이어스에 오신 걸 환영해요!')).toBeInTheDocument();
    expect(screen.getByText('춘삼이와 함께 새로운 여정을 시작해 볼까요?')).toBeInTheDocument();
  });
});
