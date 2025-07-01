import React from "react";
import { Box, Drawer } from "@mui/material";
import NodePanel from "./NodePanel";

const Sidebar = ({ drawerWidth, isSidebarOpen }) => {
  const collapsedWidth = 0;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isSidebarOpen ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: isSidebarOpen ? drawerWidth : collapsedWidth,
          transition: "width 0.3s ease",
          overflowX: "hidden",
          boxSizing: "border-box",
        },
      }}
    >
      <Box width="100%">
        <NodePanel />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
