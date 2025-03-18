import { Box, Flex, Button, Heading, Spacer } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext'; // Assuming you'll use Context for Auth

const Navbar = () => {
    const { isLoggedIn, username, logout } = useAuth(); // Use Auth Context

    return (
        <Box bg="gray.800" color="white" py={4} boxShadow="md">
            <Flex maxW="container.xl" mx="auto" align="center" justify="space-between" px={{ base: 4, md: 8 }}>
                <Heading as="h1" size="lg" fontWeight="bold" letterSpacing="tight">
                    <Link to="/">Genjutsu Beats</Link>
                </Heading>
                <Spacer />
                <Flex align="center" gap={4}>
                    <Button as={Link} to="/music" colorScheme="teal" variant="ghost" fontWeight="medium">Music</Button>
                    <Button as={Link} to="/playlists" colorScheme="teal" variant="ghost" fontWeight="medium">Playlists</Button>
                    {isLoggedIn ? (
                        <>
                            <Button as={Link} to="/profile" colorScheme="teal" variant="ghost" fontWeight="medium">{username}</Button>
                            <Button colorScheme="red" variant="ghost" fontWeight="medium" onClick={logout}>Logout</Button>
                        </>
                    ) : (
                        <>
                            <Button as={Link} to="/login" colorScheme="blue" variant="ghost" fontWeight="medium">Login</Button>
                            <Button as={Link} to="/register" colorScheme="green" variant="ghost" fontWeight="medium">Register</Button>
                        </>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};

export default Navbar;