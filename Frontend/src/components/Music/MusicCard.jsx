import { Box, Image, Text, VStack, IconButton, Flex, Spacer, useToast } from '@chakra-ui/react';
import { BsPlayFill, BsTrashFill } from 'react-icons/bs'; // Example icons
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const MusicCard = ({ music, onMusicDeleted }) => {
    const toast = useToast();
    const { authToken } = useAuth();

    const handlePlay = () => {
        // Implement logic to play music (using MusicPlayer component or state)
        console.log("Play music:", music.title);
    };

    const handleDelete = async () => {
        try {
            // Implement Delete Music API call (using axios to /api/music/:musicId, with auth token)
            await axios.delete(`/api/music/${music._id}`, {
                headers: { Authorization: `Bearer ${authToken}` } // Use authToken from context
            });
            toast({
                title: 'Music deleted.',
                description: `"${music.title}" has been removed from your library.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onMusicDeleted(); // Refresh music list in parent component
        } catch (error) {
            console.error("Error deleting music:", error);
            toast({
                title: 'Error deleting music.',
                description: error.response?.data?.message || 'Something went wrong.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" color="gray.800" boxShadow="sm">
            <Image src={music.albumArtUrl || "placeholder-album-art.png"} alt={music.album || "Album Art"} width="100%" height="200px" objectFit="cover" fallbackSrc="placeholder-album-art.png" /> {/* Placeholder image */}
            <VStack p={4} align="start">
                <Text fontWeight="bold" fontSize="md" noOfLines={2} title={music.title}>{music.title}</Text>
                <Text fontSize="sm" color="gray.600" noOfLines={1} title={music.artist || 'Unknown Artist'}>{music.artist || 'Unknown Artist'}</Text>
                <Flex mt={2} justify="space-between" w="full" align="center">
                    <IconButton
                        aria-label="Play Music"
                        icon={<BsPlayFill />}
                        colorScheme="teal"
                        size="sm"
                        onClick={handlePlay}
                    />
                    <Spacer />
                    <IconButton
                        aria-label="Delete Music"
                        icon={<BsTrashFill />}
                        colorScheme="red"
                        size="sm"
                        onClick={handleDelete}
                    />
                </Flex>
            </VStack>
        </Box>
    );
};

export default MusicCard;