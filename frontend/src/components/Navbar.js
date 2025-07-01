import React, { useState } from "react";
import {
    Menu as MenuIcon,
    SettingsOutlined,
    ArrowDropDownOutlined,
} from "@mui/icons-material";
import {
    AppBar,
    IconButton,
    Toolbar,
    Menu,
    MenuItem,
    Button,
    Box,
    Typography,
} from "@mui/material";
import FlexBetween from "./FlexBetween";
import profileImage from "../assets/profile.jpeg"
import lfLogo from "../assets/lfLogo.png"
const Navbar = ({ user, isSidebarOpen, setIsSidebarOpen, onReset, onSave, onLoad }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const isOpen = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => {
        try {
            setAnchorEl(null);
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
        }
    }
    return (
        <AppBar
            sx={{
                position: "static",
                background: "none",
                boxShadow: "none",
            }}
        >
            <Toolbar sx={{ justifyContent: "space-between" }}>
                {/* LEFT SIDE */}
                <FlexBetween gap="1rem">
                    <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <MenuIcon />
                    </IconButton>
                    <Box
                        component="img"
                        alt="LambdaFlow"
                        src={lfLogo}
                        height="40px"
                    />
                    <Typography variant="h5" fontWeight="bold">
                        <Box component="span" sx={{ color: '#214467' }}>Lambda</Box>
                        <Box component="span" sx={{ color: '#F49837' }}>Flow</Box>
                    </Typography>
                </FlexBetween>

                {/* RIGHT SIDE */}
                <FlexBetween gap="1.5rem">
                    <IconButton>
                        <SettingsOutlined sx={{ fontSize: "25px" }} />
                    </IconButton>
                    <FlexBetween>
                        <Button
                            onClick={handleClick}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                textTransform: "none",
                                gap: "1rem",
                            }}
                        >
                            <Box
                                component="img"
                                alt="profile"
                                src={profileImage}
                                height="32px"
                                width="32px"
                                borderRadius="50%"
                                sx={{ objectFit: "cover" }}
                            />
                            <Box textAlign="left">
                                <Typography
                                    fontWeight="bold"
                                    fontSize="0.85rem"
                                >
                                    {user.name}
                                </Typography>
                                <Typography
                                    fontWeight="bold"
                                    fontSize="0.75rem"
                                >
                                    {user.role}
                                </Typography>
                            </Box>
                            <ArrowDropDownOutlined
                            />
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={isOpen}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        >
                            <MenuItem onClick={handleClose}>Log Out</MenuItem>
                        </Menu>
                    </FlexBetween>
                    <FlexBetween>

                    </FlexBetween>
                </FlexBetween>
            </Toolbar>
        </AppBar >
    );
};

export default Navbar;
