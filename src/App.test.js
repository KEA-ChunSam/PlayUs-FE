import { render, screen } from '@testing-library/react';
import AppRouter from "./routes/AppRouter";
import React from "react";

test('renders learn react link', () => {
  render(<AppRouter />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
