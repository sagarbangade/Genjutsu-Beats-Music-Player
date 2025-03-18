import { FormControl, FormLabel, Input, Button, VStack, Heading, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../../AuthContext';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(username, password);
        setIsLoading(false);
        if (!success) {
            toast({
                title: 'Login failed.',
                description: 'Invalid username or password.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
        // On successful login, AuthContext will handle redirection
    };

    return (
        <VStack as="form" onSubmit={handleSubmit} spacing={6} width="full" maxW="md" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
            <Heading as="h2" size="lg" textAlign="center">Login</Heading>
            <FormControl id="username">
                <FormLabel>Username</FormLabel>
                <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </FormControl>
            <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full" isLoading={isLoading} fontWeight="medium">Login</Button>
        </VStack>
    );
};

export default LoginForm;