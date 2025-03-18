import { FormControl, FormLabel, Input, Button, VStack, Heading, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../../AuthContext';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await register(username, password, email);
        setIsLoading(false);
        if (!success) {
            toast({
                title: 'Registration failed.',
                description: 'Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: 'Registration successful.',
                description: 'Please login to continue.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }
        // On successful registration, AuthContext will redirect to login page
    };

    return (
        <VStack as="form" onSubmit={handleSubmit} spacing={6} width="full" maxW="md" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
            <Heading as="h2" size="lg" textAlign="center">Register</Heading>
            <FormControl id="username">
                <FormLabel>Username</FormLabel>
                <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </FormControl>
            <FormControl id="email">
                <FormLabel>Email (Optional)</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormControl>
            <Button type="submit" colorScheme="green" width="full" isLoading={isLoading} fontWeight="medium">Register</Button>
        </VStack>
    );
};

export default RegisterForm;