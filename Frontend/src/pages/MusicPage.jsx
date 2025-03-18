import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import MusicList from '../components/Music/MusicList';
import { Box, Heading } from '@chakra-ui/react';

const MusicPage = () => {
    return (
        <MainLayout>
            <Box p={6} bg="gray.50" borderRadius="md">
                <MusicList />
            </Box>
        </MainLayout>
    );
};

export default MusicPage;