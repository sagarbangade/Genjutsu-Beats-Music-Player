import { SimpleGrid, Text, Spinner, Button, Flex, Heading, useDisclosure, Box, useToast } from '@chakra-ui/react';
import PlaylistCard from './PlaylistCard';
import PlaylistCreateModal from './PlaylistCreateModal'; // Import Modal
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const PlaylistList = () => {
    const [playlistList, setPlaylistList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
    const toast = useToast();
    const { authToken } = useAuth();

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('/api/playlists', {
                    headers: { Authorization: `Bearer ${authToken}` } // Use authToken from context
                });
                setPlaylistList(response.data); // Assuming API returns array of playlists
                setLoading(false);
            } catch (err) {
                console.error("Error fetching playlists:", err);
                setError(err.message || "Failed to load playlists.");
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [authToken]); // Fetch playlists on component mount and when authToken changes

    const handlePlaylistCreated = (newPlaylist) => {
        // Placeholder: Re-fetch playlists to update UI. In real app, optimize by adding newPlaylist to state directly.
        fetchPlaylistsList(); // Re-fetch to update list.  For better UX, directly update state instead of re-fetching
    };

    const fetchPlaylistsList = async () => { // Re-fetch function
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/playlists', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setPlaylistList(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error re-fetching playlists:", err);
            setError(err.message || "Failed to reload playlists.");
            setLoading(false);
        }
    };


    if (loading) {
        return <Spinner size="xl" />;
    }

    if (error) {
        return <Text color="red.500">Error: {error}</Text>;
    }

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={4}>
                <Heading as="h2" size="lg">Your Playlists</Heading>
                <Button colorScheme="blue" onClick={onCreateModalOpen} fontWeight="medium">Create Playlist</Button>
            </Flex>

            <PlaylistCreateModal isOpen={isCreateModalOpen} onClose={onCreateModalClose} onPlaylistCreated={handlePlaylistCreated} />

            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={6} mt={6}>
                {playlistList.map(playlist => (
                    <PlaylistCard key={playlist._id} playlist={playlist} onPlaylistDeleted={fetchPlaylistsList} /> // Pass refresh function
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default PlaylistList;