import {
  Snackbar, Alert,
} from '@mui/material';

export const Notification = ({
  open, setOpen, notification, color
}) => {

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  }
  return (
    <Snackbar
      open={open}
      anchorOrigin={{vertical: 'top', horizontal: 'right'}}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={color === "red" ? "error" : "success"} sx={{ width: '100%' }}>
        { notification }
      </Alert>
    </Snackbar>
  )
}
