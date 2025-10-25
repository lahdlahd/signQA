import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { describe, expect, it } from 'vitest';

describe('search experience', () => {
  it('supports searching, filtering, and paging through Q&A content', async () => {
    const user = userEvent.setup();

    render(<App />);

    const searchInput = screen.getByLabelText(/search the knowledge base/i);
    const submitButton = screen.getByRole('button', { name: /search/i });

    await user.clear(searchInput);
    await user.type(searchInput, 'practice');
    await user.click(submitButton);

    const results = await screen.findAllByTestId('search-result');
    expect(results.length).toBeGreaterThan(0);

    const firstResult = results[0];
    expect(within(firstResult).getAllByText(/practice/i, { selector: 'mark' }).length).toBeGreaterThan(0);

    const summary = screen.getByTestId('results-summary');
    expect(summary.textContent).toMatch(/results/);

    const technologyFilter = screen.getByRole('checkbox', { name: 'Technology' });
    await user.click(technologyFilter);

    const filteredResult = await screen.findByText(/Which camera setups work best/i);
    expect(filteredResult).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();

    // Remove the filter to reveal additional pages
    await user.click(technologyFilter);

    await screen.findAllByTestId('search-result');

    const enabledNext = screen.getByRole('button', { name: /next/i });
    expect(enabledNext).not.toBeDisabled();

    await user.click(enabledNext);
    await screen.findByText(/Page 2 of/, { selector: '.pagination__status' });
  });
});
