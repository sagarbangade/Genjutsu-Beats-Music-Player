import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import RegisterForm from '../components/Auth/RegisterForm';
import { Box } from '@chakra-ui/react';

const RegisterPage = () => {
    return (
        <MainLayout>
            <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="inherit">
                <RegisterForm />
            </Box>
        </MainLayout>
    );
};

export default RegisterPage;