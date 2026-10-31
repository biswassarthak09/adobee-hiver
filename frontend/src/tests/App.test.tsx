import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('Adobee Hive Recruitment Portal App', () => {
  it('renders brand header and sidebar navigation correctly', async () => {
    render(<App />);

    expect(screen.getAllByText(/adobee hive/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Job Postings/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Candidate Search/i)).toBeInTheDocument();
    expect(screen.getByText(/Analytics & Pipelines/i)).toBeInTheDocument();
  });

  it('navigates to Analytics & Pipelines view when sidebar link is clicked', async () => {
    render(<App />);

    const analyticsNavBtn = screen.getByText(/Analytics & Pipelines/i);
    fireEvent.click(analyticsNavBtn);

    await waitFor(() => {
      expect(screen.getByText(/Talent Pipeline Intelligence/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Active Pipeline/i)).toBeInTheDocument();
      expect(screen.getByText(/Requisition Funnel Progression/i)).toBeInTheDocument();
    });
  });

  it('navigates to Candidate Search view and displays candidate roster', async () => {
    render(<App />);

    const candidateSearchBtn = screen.getByText(/Candidate Search/i);
    fireEvent.click(candidateSearchBtn);

    await waitFor(() => {
      expect(screen.getByText(/Hive AI Co-pilot/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Dr. Elena Rostova/i)[0]).toBeInTheDocument();
    });
  });
});
