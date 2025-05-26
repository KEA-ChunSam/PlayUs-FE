// src/routes/AppRouter.mock.js
import React from 'react';

export default function AppRouter() {
  const path = window.location.hash.replace('#', '') || '/';

  if (path === '/login') {
    return (
      <div data-testid="hash-router">
        <h1>플레이어스에 오신 걸 환영해요!</h1>
        <p>춘삼이와 함께 새로운 여정을 시작해 볼까요?</p>
      </div>
    );
  }

  return (
    <div data-testid="hash-router">
      <img src="logo.png" alt="PlayUs 로고" />
    </div>
  );
}
