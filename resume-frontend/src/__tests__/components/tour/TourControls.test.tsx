import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TourControls from '../../../components/tour/TourControls';

// A simple mock for the tour context
const mockStartTour = jest.fn();
const mockStopTour = jest.fn();
const mockResetTour = jest.fn();
const mockMarkTourCompleted = jest.fn();

let mockIsActive = false;
let mockIsFirstVisit = false;
let mockTourCompleted = false;
let mockRun = false;

// Mock the tour context hook
jest.mock('../../../contexts/TourContext', () => ({
  useTour: () => ({
    tourState: {
      isActive: mockIsActive,
      isFirstVisit: mockIsFirstVisit,
      steps: [],
      run: mockRun,
      stepIndex: 0,
      tourCompleted: mockTourCompleted
    },
    startTour: mockStartTour,
    stopTour: mockStopTour,
    resetTour: mockResetTour,
    markTourCompleted: mockMarkTourCompleted,
    goToStep: jest.fn(),
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    setTourSteps: jest.fn()
  })
}));

describe('TourControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock values
    mockIsActive = false;
    mockIsFirstVisit = false;
    mockTourCompleted = false;
    mockRun = false;
  });

  it('renders the help button', () => {
    render(<TourControls />);

    expect(screen.getByTestId('HelpOutlineIcon')).toBeInTheDocument();
    expect(document.querySelector('.help-btn')).toBeInTheDocument();
  });

  it('shows dot badge for first-time visitors', () => {
    // Update mock state for this test
    mockIsFirstVisit = true;

    render(<TourControls />);

    // Check if badge is visible (specific implementation depends on MUI)
    const badge = document.querySelector('.MuiBadge-badge');
    expect(badge).not.toHaveClass('MuiBadge-invisible');
  });

  it('opens the menu when help button is clicked', async () => {
    render(<TourControls />);

    // Click the help button
    const helpButton = document.querySelector('.help-btn');
    if (helpButton) userEvent.click(helpButton);

    // Check if menu is opened with Start Tour option
    await waitFor(() => {
      expect(screen.getByText('Start Tour')).toBeInTheDocument();
    });
  });

  it('calls startTour when Start Tour is clicked', async () => {
    render(<TourControls />);

    // Open the menu
    const helpButton = document.querySelector('.help-btn');
    if (helpButton) userEvent.click(helpButton);

    // Click the Start Tour button
    const startTourButton = await screen.findByText('Start Tour');
    userEvent.click(startTourButton);

    expect(mockStartTour).toHaveBeenCalled();
  });

  it('shows Pause Tour option when tour is active', async () => {
    // Update mock state for this test
    mockIsActive = true;
    mockRun = true;

    render(<TourControls />);

    // Open the menu
    const helpButton = document.querySelector('.help-btn');
    if (helpButton) userEvent.click(helpButton);

    // Check for Pause Tour option
    await waitFor(() => {
      expect(screen.getByText('Pause Tour')).toBeInTheDocument();
    });
  });

  it('shows Skip Tour option when tour is not completed', async () => {
    // Default mock state has tourCompleted = false
    render(<TourControls />);

    // Open the menu
    const helpButton = document.querySelector('.help-btn');
    if (helpButton) userEvent.click(helpButton);

    // Check for Skip Tour option
    await waitFor(() => {
      expect(screen.getByText('Skip Tour')).toBeInTheDocument();
    });
  });

  it('shows Tour Completed when tour is completed', async () => {
    // Update mock state for this test
    mockTourCompleted = true;

    render(<TourControls />);

    // Open the menu
    const helpButton = document.querySelector('.help-btn');
    if (helpButton) userEvent.click(helpButton);

    // Check for Tour Completed option
    await waitFor(() => {
      expect(screen.getByText('Tour Completed')).toBeInTheDocument();
    });
  });
}); 