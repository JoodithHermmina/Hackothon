import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TourProvider } from '../../../contexts/TourContext';
import TourControls from '../../../components/tour/TourControls';

// Mock the tour context values
jest.mock('../../../contexts/TourContext', () => {
  const originalModule = jest.requireActual('../../../contexts/TourContext');
  
  return {
    ...originalModule,
    useTour: jest.fn(() => ({
      tourState: {
        isActive: false,
        isFirstVisit: false,
        steps: [],
        run: false,
        stepIndex: 0,
        tourCompleted: false
      },
      startTour: jest.fn(),
      stopTour: jest.fn(),
      resetTour: jest.fn(),
      markTourCompleted: jest.fn()
    }))
  };
});

describe('TourControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the help button', () => {
    render(
      <TourProvider>
        <TourControls />
      </TourProvider>
    );

    expect(screen.getByTestId('HelpOutlineIcon')).toBeInTheDocument();
    expect(document.querySelector('.help-btn')).toBeInTheDocument();
  });

  it('shows dot badge for first-time visitors', () => {
    const { useTour } = require('../../../contexts/TourContext');
    useTour.mockReturnValueOnce({
      tourState: {
        isActive: false,
        isFirstVisit: true,
        steps: [],
        run: false,
        stepIndex: 0,
        tourCompleted: false
      },
      startTour: jest.fn(),
      stopTour: jest.fn(),
      resetTour: jest.fn(),
      markTourCompleted: jest.fn()
    });

    render(
      <TourProvider>
        <TourControls />
      </TourProvider>
    );

    // Check if badge is visible (specific implementation depends on MUI)
    const badge = document.querySelector('.MuiBadge-badge');
    expect(badge).not.toHaveClass('MuiBadge-invisible');
  });

  it('opens the menu when help button is clicked', async () => {
    render(
      <TourProvider>
        <TourControls />
      </TourProvider>
    );

    // Click the help button
    const helpButton = document.querySelector('.help-btn');
    if (helpButton) userEvent.click(helpButton);

    // Check if menu is opened with Start Tour option
    await waitFor(() => {
      expect(screen.getByText('Start Tour')).toBeInTheDocument();
    });
  });

  it('calls startTour when Start Tour is clicked', async () => {
    const { useTour } = require('../../../contexts/TourContext');
    const startTourMock = jest.fn();
    useTour.mockReturnValue({
      tourState: {
        isActive: false,
        isFirstVisit: false,
        steps: [],
        run: false,
        stepIndex: 0,
        tourCompleted: false
      },
      startTour: startTourMock,
      stopTour: jest.fn(),
      resetTour: jest.fn(),
      markTourCompleted: jest.fn()
    });

    render(
      <TourProvider>
        <TourControls />
      </TourProvider>
    );

    // Open the menu
    const helpButton = document.querySelector('.help-btn');
    if (helpButton) userEvent.click(helpButton);

    // Click the Start Tour button
    const startTourButton = await screen.findByText('Start Tour');
    userEvent.click(startTourButton);

    expect(startTourMock).toHaveBeenCalled();
  });

  it('shows Pause Tour option when tour is active', async () => {
    const { useTour } = require('../../../contexts/TourContext');
    useTour.mockReturnValue({
      tourState: {
        isActive: true,
        isFirstVisit: false,
        steps: [],
        run: true,
        stepIndex: 0,
        tourCompleted: false
      },
      startTour: jest.fn(),
      stopTour: jest.fn(),
      resetTour: jest.fn(),
      markTourCompleted: jest.fn()
    });

    render(
      <TourProvider>
        <TourControls />
      </TourProvider>
    );

    // Open the menu
    const helpButton = document.querySelector('.help-btn');
    if (helpButton) userEvent.click(helpButton);

    // Check for Pause Tour option
    await waitFor(() => {
      expect(screen.getByText('Pause Tour')).toBeInTheDocument();
    });
  });

  it('shows Skip Tour option when tour is not completed', async () => {
    const { useTour } = require('../../../contexts/TourContext');
    useTour.mockReturnValue({
      tourState: {
        isActive: false,
        isFirstVisit: false,
        steps: [],
        run: false,
        stepIndex: 0,
        tourCompleted: false
      },
      startTour: jest.fn(),
      stopTour: jest.fn(),
      resetTour: jest.fn(),
      markTourCompleted: jest.fn()
    });

    render(
      <TourProvider>
        <TourControls />
      </TourProvider>
    );

    // Open the menu
    const helpButton = document.querySelector('.help-btn');
    if (helpButton) userEvent.click(helpButton);

    // Check for Skip Tour option
    await waitFor(() => {
      expect(screen.getByText('Skip Tour')).toBeInTheDocument();
    });
  });

  it('shows Tour Completed when tour is completed', async () => {
    const { useTour } = require('../../../contexts/TourContext');
    useTour.mockReturnValue({
      tourState: {
        isActive: false,
        isFirstVisit: false,
        steps: [],
        run: false,
        stepIndex: 0,
        tourCompleted: true
      },
      startTour: jest.fn(),
      stopTour: jest.fn(),
      resetTour: jest.fn(),
      markTourCompleted: jest.fn()
    });

    render(
      <TourProvider>
        <TourControls />
      </TourProvider>
    );

    // Open the menu
    const helpButton = document.querySelector('.help-btn');
    if (helpButton) userEvent.click(helpButton);

    // Check for Tour Completed option
    await waitFor(() => {
      expect(screen.getByText('Tour Completed')).toBeInTheDocument();
    });
  });
}); 