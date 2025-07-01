import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Builder from "../pages/Builder";

const Layout = ({ name, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const data = { name, role };

  return (
    <Box display="flex" width="100vw" height="100vh">
      <Sidebar
        user={data}
        drawerWidth="300px"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Box display="flex" flexDirection="column" flexGrow={1} height="100%">
        {/* Give Navbar a fixed height */}
        <Box height="50px">
          <Navbar
            user={data}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </Box>
        {/* Builder fills remaining space */}
        <Box flexGrow={1} minHeight={0} p="1rem">
          <Builder />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
