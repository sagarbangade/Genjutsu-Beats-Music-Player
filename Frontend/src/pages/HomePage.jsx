import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Box, Heading, Text, Center, VStack } from '@chakra-ui/react';

const HomePage = () => {
    return (
        <MainLayout>
            <Center py={12}>
                <VStack spacing={6} textAlign="center">
                    <Heading as="h2" size="3xl" fontWeight="bold" letterSpacing="tight">
                        Welcome to <Text as="span" color="teal.500">Genjutsu Beats</Text>
                    </Heading>
                    <Text fontSize="xl" color="gray.600">
                        Your personal web-based music player. Upload, organize, and stream your music.
                    </Text>
                    {/* Add more homepage content, features overview, etc. */}
                </VStack>
            </Center>
        </MainLayout>
    );
};

export default HomePage;