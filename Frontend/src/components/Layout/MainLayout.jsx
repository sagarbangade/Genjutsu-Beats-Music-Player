import React from "react";
import Navbar from "./Navbar";
import { Box, Container } from "@chakra-ui/react";
import MusicPlayer from "../Player/MusicPlayer"; // Assuming you have MusicPlayer

const MainLayout = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.100">
      {/* <Navbar />  */}
      <Container maxW="container.xl" py={8} px={{ base: 4, md: 8 }}>
        {children} {/* **`children` prop renders the page content** */}
      </Container>
      <MusicPlayer /> {/* Persistent Music Player at the bottom */}
    </Box>
  );
};

export default MainLayout;
