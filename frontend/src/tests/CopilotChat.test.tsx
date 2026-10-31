import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CopilotChat } from '../components/candidatePool/CopilotChat';

describe('CopilotChat Component', () => {
  it('renders active vector tokens and quick prompts', () => {
    const handleAdd = vi.fn();
    const handleRemove = vi.fn();
    const handleReset = vi.fn();

    render(
      <CopilotChat
        activeTokens={['Exp: 5+ yrs Python/TS', 'Domain: RAG / LLM']}
        onAddToken={handleAdd}
        onRemoveToken={handleRemove}
        onResetTokens={handleReset}
      />
    );

    expect(screen.getByText(/Hive AI Co-pilot/i)).toBeInTheDocument();
    expect(screen.getByText('Exp: 5+ yrs Python/TS')).toBeInTheDocument();
    expect(screen.getByText('Domain: RAG / LLM')).toBeInTheDocument();

    const quickPrompt = screen.getByText('+ Prior Founders');
    fireEvent.click(quickPrompt);
    expect(handleAdd).toHaveBeenCalledWith('Prior Founders');
  });

  it('allows user to enter prompt and triggers filter submission', () => {
    const handleAdd = vi.fn();
    const handleRemove = vi.fn();
    const handleReset = vi.fn();

    render(
      <CopilotChat
        activeTokens={[]}
        onAddToken={handleAdd}
        onRemoveToken={handleRemove}
        onResetTokens={handleReset}
      />
    );

    const textarea = screen.getByPlaceholderText(/Ask Hive AI to filter/i);
    fireEvent.change(textarea, { target: { value: 'Show me candidates with 5+ yrs experience in SF' } });

    const runBtn = screen.getByText(/Run Filter/i);
    fireEvent.click(runBtn);

    expect(handleAdd).toHaveBeenCalledWith('Exp: 5+ yrs');
    expect(handleAdd).toHaveBeenCalledWith('Location: SF Hybrid');
  });
});
