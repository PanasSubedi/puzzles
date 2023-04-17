import './Home.css';

import { NavigationBar } from '../components/NavigationBar';

import {
  List, ListItem, ListItemText, ListItemButton,
  Container, Grid,
  Typography,
} from '@mui/material';

export const Home = () => {
  return (
    <>
      <NavigationBar />
      <Container className="container">
        <Typography variant="h5">Choose a puzzle</Typography>
        <Grid container justifyContent="center">
          <Grid item md={4} sm={12}>
          <List>
            <ListItem disablePadding>
              <ListItemButton component="a" href={process.env.PUBLIC_URL+"/#/nQueens"}>
                <ListItemText primary="N Queens" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component="a" href={process.env.PUBLIC_URL+"/#/polysphere"}>
                <ListItemText primary="Polysphere" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component="a" href={process.env.PUBLIC_URL+"/#/pyramid"}>
                <ListItemText primary="Pyramid" />
              </ListItemButton>
            </ListItem>
          </List>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
