// src/App.test.js
import { render, screen } from '@testing-library/react';
import AppRouter from './routes/AppRouter.mock'; // ✅ 테스트용 mock import
import React from 'react';

describe('AppRouter', () => {
  beforeEach(() => {
    window.location.hash = ''; // 테스트 전마다 초기화
  });

  test('스플래시 페이지가 기본 경로(/)에서 렌더링됩니다', () => {
    render(<AppRouter />);
    expect(screen.getByAltText('PlayUs 로고')).toBeInTheDocument();
  });

  test('로그인 페이지가 /login 경로에서 렌더링됩니다', () => {
    window.location.hash = '#/login';
    render(<AppRouter />);
    expect(screen.getByText('플레이어스에 오신 걸 환영해요!')).toBeInTheDocument();
    expect(screen.getByText('춘삼이와 함께 새로운 여정을 시작해 볼까요?')).toBeInTheDocument();
  });
});
