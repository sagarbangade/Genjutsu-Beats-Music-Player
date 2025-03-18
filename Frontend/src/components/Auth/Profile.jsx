import { Box, Heading, Text, VStack, Avatar, Button } from '@chakra-ui/react';
import { useAuth } from '../../AuthContext'; // Assuming you'll use Context for Auth

const Profile = () => {
    const { username, email } = useAuth(); // Get profile info from context

    return (
        <VStack spacing={8} align="center" p={6} bg="white" borderRadius="md" boxShadow="md">
            <Avatar size="xl" name={username} src="" /> {/* Add profile picture source if available */}
            <Heading as="h2" size="xl">{username}</Heading>
            <Text fontSize="md" color="gray.600">Email: {email || 'Not provided'}</Text>
            {/* Add actions like Edit Profile, Change Password buttons if needed */}
        </VStack>
    );
};

export default Profile;