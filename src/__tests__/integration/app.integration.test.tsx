import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { describe, expect, it } from 'vitest';

describe('App integration', () => {
  it('allows a learner to translate a phrase end-to-end', async () => {
    const user = userEvent.setup();

    render(<App />);

    const languageSelect = screen.getByLabelText(/sign language/i);
    const phraseSelect = screen.getByLabelText(/phrase/i);
    const submitButton = screen.getByRole('button', { name: /show translation/i });

    await user.selectOptions(languageSelect, 'BSL');
    await user.selectOptions(phraseSelect, 'How are you?');
    await user.click(submitButton);

    const translation = await screen.findByTestId('translation-result');

    expect(translation).toHaveTextContent('How are you?');
    expect(translation).toHaveTextContent('Both hands open, palms in');
    expect(translation).toHaveTextContent('intermediate');
  });

  it('clears the previous translation when switching languages', async () => {
    const user = userEvent.setup();

    render(<App />);

    const languageSelect = screen.getByLabelText(/sign language/i);
    const submitButton = screen.getByRole('button', { name: /show translation/i });

    await user.click(submitButton);
    expect(await screen.findByTestId('translation-result')).toBeInTheDocument();

    await user.selectOptions(languageSelect, 'BSL');

    expect(screen.queryByTestId('translation-result')).not.toBeInTheDocument();
  });
});
