/**
 * @file Test file for main App component
 * Uses react Testing Library
 */

import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * Basic test to verify if "learn react" text renders in the app.
 */
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
