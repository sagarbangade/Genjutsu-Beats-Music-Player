import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Box, Heading, Text } from '@chakra-ui/react';

const PlaylistDetailsPage = () => {
    return (
        <MainLayout>
            <Box p={6} bg="gray.50" borderRadius="md">
                <Heading as="h2" size="2xl" mb={4}>Playlist Details</Heading>
                {/* Implement Playlist Details component here to show songs in playlist, etc. */}
                <Text>Playlist details and song list will be displayed here.</Text>
            </Box>
        </MainLayout>
    );
};

export default PlaylistDetailsPage;