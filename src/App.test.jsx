import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AppRouter from './routes/AppRouter'

// Mock router hooks
const mockNavigate = vi.fn()
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
}

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    Routes: ({ children }) => <div data-testid="routes">{children}</div>,
    Route: ({ element, path }) => (
      <div data-testid={`route-${path || 'default'}`}>{element}</div>
    ),
    Outlet: () => <div data-testid="outlet" />
  };
});

// Mock components
vi.mock('./components/MobileView/MobileView', () => ({
  default: ({ children }) => <div data-testid="mobile-view">{children}</div>
}))

vi.mock('./pages/Login/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}))

vi.mock('./pages/InitialProfile/SetProfile', () => ({
  default: () => <div data-testid="set-profile-page">Set Profile Page</div>
}))

describe('AppRouter', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  it('기본 라우팅 구조가 올바르게 렌더링되는지 확인', () => {
    render(<AppRouter />)

    expect(screen.getByTestId('routes')).toBeInTheDocument()
    const mobileViews = screen.getAllByTestId('mobile-view')
    expect(mobileViews.length).toBeGreaterThan(0)

    const homeRoute = screen.getByTestId('route-/home')
    const { getByTestId: getByTestIdInHome } = within(homeRoute)
    expect(getByTestIdInHome('mobile-view')).toBeInTheDocument()
  })

  it('여러 주요 경로에서 mobile-view 포함 여부 확인', () => {
    render(<AppRouter />)

    const mainRoutes = [
      '/home',
      '/community',
      '/schedule',
      '/profile/:userId',
      '/diary/list',
      '/party/matchid'
    ]

    mainRoutes.forEach(route => {
      const routeElement = screen.getByTestId(`route-${route}`)
      const { getByTestId: getByTestIdInRoute } = within(routeElement)
      expect(getByTestIdInRoute('mobile-view')).toBeInTheDocument()
    })
  })
})
