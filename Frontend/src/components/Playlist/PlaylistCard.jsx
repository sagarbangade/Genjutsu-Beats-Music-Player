import { Box, Image, Text, VStack, IconButton, Flex, Spacer, useToast } from '@chakra-ui/react';
import { BsPlayFill, BsTrashFill, BsPencilFill } from 'react-icons/bs'; // Example icons
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const PlaylistCard = ({ playlist, onPlaylistDeleted }) => {
    const toast = useToast();
    const { authToken } = useAuth();

    const handlePlayPlaylist = () => {
        // Implement logic to play the entire playlist (using MusicPlayer component or state)
        console.log("Play playlist:", playlist.name);
    };

    const handleDeletePlaylist = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`/api/playlists/${playlist._id}`, {
                headers: { Authorization: `Bearer ${authToken}` } // Use authToken from context
            });
            toast({
                title: 'Playlist deleted.',
                description: `"${playlist.name}" has been removed.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onPlaylistDeleted(); // Refresh playlist list
        } catch (error) {
            console.error("Error deleting playlist:", error);
            toast({
                title: 'Error deleting playlist.',
                description: error.response?.data?.message || 'Something went wrong.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleEditPlaylist = () => {
        // Implement logic to edit playlist (open modal or redirect to edit page)
        console.log("Edit playlist:", playlist.name);
    };


    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" color="gray.800" boxShadow="sm">
            <Image src={playlist.coverImageUrl || "placeholder-playlist-cover.png"} alt={playlist.name} width="100%" height="200px" objectFit="cover" fallbackSrc="placeholder-playlist-cover.png" /> {/* Placeholder image */}
            <VStack p={4} align="start">
                <Text fontWeight="bold" fontSize="md" noOfLines={2} title={playlist.name}>
                    <Link to={`/playlists/${playlist._id}`}>{playlist.name}</Link> {/* Link to PlaylistDetailsPage */}
                </Text>
                <Text fontSize="sm" color="gray.600" noOfLines={2} title={playlist.description}>{playlist.description}</Text>
                <Flex mt={2} justify="space-between" w="full" align="center">
                    <IconButton
                        aria-label="Play Playlist"
                        icon={<BsPlayFill />}
                        colorScheme="teal"
                        size="sm"
                        onClick={handlePlayPlaylist}
                    />
                    <Spacer />
                    <IconButton
                        aria-label="Edit Playlist"
                        icon={<BsPencilFill />}
                        colorScheme="blue"
                        size="sm"
                        onClick={handleEditPlaylist} // Implement Edit functionality
                    />
                    <IconButton
                        aria-label="Delete Playlist"
                        icon={<BsTrashFill />}
                        colorScheme="red"
                        size="sm"
                        onClick={handleDeletePlaylist}
                    />
                </Flex>
            </VStack>
        </Box>
    );
};

export default PlaylistCard;