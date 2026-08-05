// frontend/src/components/layoutComponents/Navbar.tsx

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import InfoIcon from "@mui/icons-material/Info";
import ChatIcon from "@mui/icons-material/Chat";
import Badge from "@mui/material/Badge";

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";

import { UserAuthContext } from "../../authLogin/context/UserAuthContext";
import { handleLogout } from "../../authLogin/authFunctions";
// import ChatPanel from "../../components/chat/ChatPanel";

const Navbar = () => {
  const { user, setUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const isChatOpenRef = useRef(isChatOpen);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setIsChatOpen(false);
    handleLogout(setUser, navigate);
  };

  const handleChatToggle = () => {
    handleMenuClose();
    setIsChatOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadChatCount(0);
      }
      return next;
    });
  };

  // const handleChatClose = () => {
  //   setIsChatOpen(false);
  // };

  // const handleChatIncomingMessage = () => {
  //   if (!isChatOpenRef.current) {
  //     setUnreadChatCount((prev) => prev + 1);
  //   }
  // };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#fffdf7",
          color: "#4a3f35",
          borderBottom: "1px solid #e5e0d8",
        }}
      >
        <Toolbar>
          {/* LOGO */}
          <Box
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Student Prioritizer
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* DESKTOP */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            <Tooltip title="Info">
              <IconButton component={NavLink} to="/" sx={{ color: "inherit" }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>

            {user?.roles?.includes("ADMIN") && (
              <Tooltip title="dashboard">
                <IconButton
                  component={NavLink}
                  to="/dashboard"
                  sx={{ color: "inherit" }}
                >
                  <AdminPanelSettingsIcon />
                </IconButton>
              </Tooltip>
            )}

            {user ? (
              <>
                <Tooltip title="Chat">
                  <IconButton
                    onClick={handleChatToggle}
                    sx={{ color: "inherit" }}
                  >
                    <Badge
                      badgeContent={unreadChatCount}
                      color="error"
                      invisible={unreadChatCount === 0}
                    >
                      <ChatIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Profile">
                  <IconButton
                    component={NavLink}
                    to="/user"
                    sx={{ color: "inherit" }}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Logout">
                  <IconButton
                    onClick={handleLogoutClick}
                    sx={{ color: "inherit" }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Login">
                <IconButton
                  component={Link}
                  to="/login"
                  sx={{ color: "inherit" }}
                >
                  <LoginIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* MOBILE CHAT ICON - outside hamburger */}
          {user && (
            <Box sx={{ display: { xs: "flex", sm: "none" } }}>
              <Tooltip title="Chat">
                <IconButton
                  onClick={handleChatToggle}
                  sx={{ color: "inherit" }}
                >
                  <Badge
                    badgeContent={unreadChatCount}
                    color="error"
                    invisible={unreadChatCount === 0}
                  >
                    <ChatIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* MOBILE HAMBURGER */}
          <Box sx={{ display: { xs: "flex", sm: "none" } }}>
            <IconButton onClick={handleMenuOpen} sx={{ color: "inherit" }}>
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem component={NavLink} to="/" onClick={handleMenuClose}>
                Info
              </MenuItem>

              {user?.roles?.includes("ADMIN") && (
                <MenuItem
                  component={NavLink}
                  to="/dashboard"
                  onClick={handleMenuClose}
                >
                  dashboard
                </MenuItem>
              )}

              {user && (
                <MenuItem
                  component={NavLink}
                  to="/user"
                  onClick={handleMenuClose}
                >
                  Profile
                </MenuItem>
              )}

              {user ? (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogoutClick();
                  }}
                >
                  Logout
                </MenuItem>
              ) : (
                <MenuItem
                  component={Link}
                  to="/login"
                  onClick={handleMenuClose}
                >
                  Login
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* {user && (
        <ChatPanel
          isOpen={isChatOpen}
          onClose={handleChatClose}
          onIncomingMessage={handleChatIncomingMessage}
        />
      )} */}

      {/* offset για να μη σκεπάζει το fixed navbar το περιεχόμενο */}
      <Toolbar />
    </>
  );
};

export default Navbar;