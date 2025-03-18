import React, { useState, useEffect } from 'react';
import {
    Box, Heading, Text, VStack, HStack, Button, IconButton, Spinner, useToast, Image, SimpleGrid
} from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MusicCard from '../Music/MusicCard'; // Reusing MusicCard to display songs
import AddSongsToPlaylistModal from './AddSongsToPlaylistModal'; // Import AddSongsModal
import RemoveSongFromPlaylistModal from './RemoveSongFromPlaylistModal'; // Import RemoveSongModal
import { useDisclosure } from '@chakra-ui/react';
import { BsArrowLeft, BsPencilFill } from 'react-icons/bs';

const PlaylistDetails = () => {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();
    const { isOpen: isAddSongsModalOpen, onOpen: onAddSongsModalOpen, onClose: onAddSongsModalClose } = useDisclosure();
    const { isOpen: isRemoveSongModalOpen, onOpen: onRemoveSongModalOpen, onClose: onRemoveSongModalClose } = useDisclosure();
    const [selectedSongToRemove, setSelectedSongToRemove] = useState(null);
    const { authToken } = useAuth();

    useEffect(() => {
        const fetchPlaylistDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/playlists/${playlistId}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setPlaylist(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching playlist details:", err);
                setError(err.message || "Failed to load playlist details.");
                setLoading(false);
            }
        };

        fetchPlaylistDetails();
    }, [playlistId, authToken]); // Fetch playlist details on component mount and when playlistId or authToken changes

    const handleSongsAddedToPlaylist = (updatedPlaylist) => {
        setPlaylist(updatedPlaylist); // Update playlist with newly added songs
    };

    const handleSongRemovedFromPlaylist = (updatedPlaylist) => {
        setPlaylist(updatedPlaylist); // Update playlist after song removal
    };

    const handleRemoveSongClick = (songId) => {
        setSelectedSongToRemove(songId);
        onRemoveSongModalOpen();
    };


    if (loading) {
        return <Spinner size="xl" />;
    }

    if (error || !playlist) {
        return <Text color="red.500">Error: {error || "Playlist not found."}</Text>;
    }

    return (
        <Box p={6} bg="gray.50" borderRadius="md">
            <HStack mb={4} justify="space-between">
                <Button as={Link} to="/playlists" leftIcon={<BsArrowLeft />} size="sm" variant="ghost" colorScheme="teal" fontWeight="medium">Back to Playlists</Button>
                <Heading as="h2" size="2xl">{playlist.name}</Heading>
                <Button onClick={onAddSongsModalOpen} colorScheme="blue" size="sm" fontWeight="medium">Add Songs</Button>
            </HStack>

            <AddSongsToPlaylistModal
                isOpen={isAddSongsModalOpen}
                onClose={onAddSongsModalClose}
                playlistId={playlistId}
                onSongsAdded={handleSongsAddedToPlaylist}
            />
            <RemoveSongFromPlaylistModal
                isOpen={isRemoveSongModalOpen}
                onClose={onRemoveSongModalClose}
                playlistId={playlistId}
                songIdToRemove={selectedSongToRemove}
                onSongRemoved={handleSongRemovedFromPlaylist}
            />

            <Flex direction="column" mb={6}>
                <Image
                    src={playlist.coverImageUrl || "placeholder-playlist-cover.png"}
                    alt={playlist.name}
                    borderRadius="md"
                    boxSize="250px"
                    fallbackSrc="placeholder-playlist-cover.png"
                    mb={4}
                />
                <VStack align="start">
                    <Text fontSize="md" fontWeight="bold">Description:</Text>
                    <Text fontSize="sm" color="gray.700">{playlist.description || 'No description provided.'}</Text>
                </VStack>
            </Flex>

            <Heading as="h3" size="lg" mb={4}>Songs in Playlist</Heading>
            {playlist.songs.length === 0 ? (
                <Text color="gray.600">No songs added to this playlist yet.</Text>
            ) : (
                <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                    {playlist.songs.map(song => (
                        <Box key={song._id} position="relative">
                            <MusicCard music={song} />
                            <IconButton
                                aria-label="Remove from Playlist"
                                icon={<BsPencilFill />} // Reusing pencil icon for remove action visually
                                colorScheme="red"
                                size="sm"
                                position="absolute"
                                top="2" right="2"
                                onClick={() => handleRemoveSongClick(song._id)}
                            />
                        </Box>
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
};

export default PlaylistDetails;