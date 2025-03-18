import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Profile from '../components/Auth/Profile';
import { Box } from '@chakra-ui/react';

const ProfilePage = () => {
    return (
        <MainLayout>
            <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="inherit">
                <Profile />
            </Box>
        </MainLayout>
    );
};

export default ProfilePage;