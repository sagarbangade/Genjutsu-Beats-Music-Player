import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import PlaylistList from '../components/Playlist/PlaylistList';
import { Box, Heading } from '@chakra-ui/react';

const PlaylistsPage = () => {
    return (
        <MainLayout>
            <Box p={6} bg="gray.50" borderRadius="md">
                <PlaylistList />
            </Box>
        </MainLayout>
    );
};

export default PlaylistsPage;