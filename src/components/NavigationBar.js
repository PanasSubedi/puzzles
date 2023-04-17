import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

import logo from '../assets/logo.png';

import {
  Icon
} from '@mui/material';

import {
  Settings as SettingsIcon,
} from '@mui/icons-material';

const pages = [
  {
    id: 1,
    title: 'N Queen',
    href: '/#/nQueens',
  },
  {
    id: 2,
    title: 'Polysphere',
    href: '/#/polysphere',
  },
  {
    id: 3,
    title: 'Pyramid',
    href: '/#/pyramid',
  }
];

const pageTitle = "Puzzles";

export const NavigationBar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = event => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static" color="transparent">
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/* MAIN LOGO AND WEBSITE NAME: Only displayed on computer screens */}
          <Icon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
            <img src={logo} height={22} width={22} alt="website-logo" />
          </Icon>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 5,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {pageTitle}
          </Typography>
          {/* END MAIN LOGO AND WEBSITE NAME: Only displayed on computer screens */}


          {/* PHONE MENU: Only displayed on small screens */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.id} onClick={handleCloseNavMenu} href={process.env.PUBLIC_URL + page.href}>
                  <Typography sx={{color: "#3c3c3c"}} textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {/* END PHONE MENU */}


          {/* PHONE LOGO AND WEBSITE NAME: Only displayed on small screens */}
          <Icon sx={{ display: { xs: 'flex', md:'none' }, mr: 1 }}>
            <img src={logo} height={22} width={22} alt="website-logo" />
          </Icon>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {pageTitle}
          </Typography>
          {/* END PHONE LOGO AND WEBSITE NAME */}

          {/* LIST OF PAGES: All the pages in the website */}
          <Box sx={{ flexGrow: 1, flexDirection: 'row-reverse', display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.id}
                onClick={handleCloseNavMenu}
                sx={{ mx: 2, my:2, color: '#3c3c3c', display: 'block' }}
                component={'a'}
                href={page.href}
              >
                {page.title}
              </Button>
            ))}
          </Box>
          {/* END LIST OF PAGES */}

          {/* SETTINGS ICON */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Settings">
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
          {/* END SETTINGS ICON */}

        </Toolbar>
      </Container>
    </AppBar>
  );
};
