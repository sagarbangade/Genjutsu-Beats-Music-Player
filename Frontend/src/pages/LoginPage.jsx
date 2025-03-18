import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import LoginForm from '../components/Auth/LoginForm';
import { Box } from '@chakra-ui/react';

const LoginPage = () => {
    return (
        <MainLayout>
            <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="inherit">
                <LoginForm />
            </Box>
        </MainLayout>
    );
};

export default LoginPage;