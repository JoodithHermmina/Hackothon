import React, { useState } from 'react';
import { 
  IconButton, 
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Badge
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { useTour } from '../../contexts/TourContext';

interface TourControlsProps {
  className?: string;
}

const TourControls: React.FC<TourControlsProps> = ({ className }) => {
  const { 
    tourState, 
    startTour, 
    stopTour, 
    resetTour, 
    markTourCompleted 
  } = useTour();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStartTour = () => {
    startTour();
    handleMenuClose();
  };

  const handleStopTour = () => {
    stopTour();
    handleMenuClose();
  };

  const handleResetTour = () => {
    resetTour();
    handleMenuClose();
  };

  const handleSkipTour = () => {
    setConfirmDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmSkip = () => {
    markTourCompleted();
    setConfirmDialogOpen(false);
  };

  const handleCancelSkip = () => {
    setConfirmDialogOpen(false);
  };

  return (
    <>
      <Tooltip title="Tour Help" arrow>
        <Badge
          color="secondary"
          variant="dot"
          invisible={!tourState.isFirstVisit || tourState.tourCompleted}
        >
          <IconButton
            className={`help-btn ${className || ''}`}
            onClick={handleMenuOpen}
            color="primary"
          >
            <HelpOutlineIcon />
          </IconButton>
        </Badge>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {!tourState.isActive && (
          <MenuItem onClick={handleStartTour}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Start Tour" />
          </MenuItem>
        )}

        {tourState.isActive && (
          <MenuItem onClick={handleStopTour}>
            <ListItemIcon>
              <StopIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Pause Tour" />
          </MenuItem>
        )}

        <MenuItem onClick={handleResetTour}>
          <ListItemIcon>
            <ReplayIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Restart Tour" />
        </MenuItem>

        {!tourState.tourCompleted && (
          <MenuItem onClick={handleSkipTour}>
            <ListItemIcon>
              <SkipNextIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Skip Tour" />
          </MenuItem>
        )}

        {tourState.tourCompleted && (
          <MenuItem disabled>
            <ListItemIcon>
              <CheckCircleOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Tour Completed" />
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelSkip}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Skip Tour?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to skip the tour? You can always restart it later from the help menu.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSkip} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmSkip} color="primary" autoFocus>
            Skip Tour
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TourControls; 