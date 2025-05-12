import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TourWelcomeDialog from '../../../components/tour/TourWelcomeDialog';

describe('TourWelcomeDialog', () => {
  const mockStartTour = jest.fn();
  const mockSkipTour = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <TourWelcomeDialog 
        open={true} 
        onStartTour={mockStartTour} 
        onSkipTour={mockSkipTour} 
      />
    );

    // Check title
    expect(screen.getByText('Welcome to ThoughtWorks Resume Builder!')).toBeInTheDocument();
    
    // Check content
    expect(screen.getByText(/it looks like this is your first time/i)).toBeInTheDocument();
    
    // Check list items
    expect(screen.getByText(/how to navigate between different sections/i)).toBeInTheDocument();
    expect(screen.getByText(/where to find help and sample data/i)).toBeInTheDocument();
    expect(screen.getByText(/the key features of the resume builder/i)).toBeInTheDocument();
    expect(screen.getByText(/how to preview and download your resume/i)).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /skip tour/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start tour/i })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <TourWelcomeDialog 
        open={false} 
        onStartTour={mockStartTour} 
        onSkipTour={mockSkipTour} 
      />
    );

    // Dialog should not be in the document when closed
    expect(screen.queryByText('Welcome to ThoughtWorks Resume Builder!')).not.toBeInTheDocument();
  });

  it('calls onStartTour when Start Tour button is clicked', () => {
    render(
      <TourWelcomeDialog 
        open={true} 
        onStartTour={mockStartTour} 
        onSkipTour={mockSkipTour} 
      />
    );

    // Click Start Tour button
    fireEvent.click(screen.getByRole('button', { name: /start tour/i }));
    
    // Check if the callback was called
    expect(mockStartTour).toHaveBeenCalledTimes(1);
    expect(mockSkipTour).not.toHaveBeenCalled();
  });

  it('calls onSkipTour when Skip Tour button is clicked', () => {
    render(
      <TourWelcomeDialog 
        open={true} 
        onStartTour={mockStartTour} 
        onSkipTour={mockSkipTour} 
      />
    );

    // Click Skip Tour button
    fireEvent.click(screen.getByRole('button', { name: /skip tour/i }));
    
    // Check if the callback was called
    expect(mockSkipTour).toHaveBeenCalledTimes(1);
    expect(mockStartTour).not.toHaveBeenCalled();
  });
}); 