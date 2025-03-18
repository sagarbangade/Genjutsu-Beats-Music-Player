import { SimpleGrid, Text, Spinner, Button, Flex, Heading, useDisclosure, Box } from '@chakra-ui/react';
import MusicCard from './MusicCard';
import MusicUploadModal from './MusicUploadModal'; // Import Modal
import MusicSearch from './MusicSearch';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { useAuth } from '../../AuthContext';

const MusicList = () => {
    const [musicList, setMusicList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isOpen: isUploadModalOpen, onOpen: onUploadModalOpen, onClose: onUploadModalClose } = useDisclosure();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMusicList, setFilteredMusicList] = useState([]); // For search results
    const { authToken } = useAuth();

    useEffect(() => {
        const fetchMusic = async () => {
            try {
                setLoading(true);
                setError(null);
                // Implement API call to fetch music list (using axios to /api/music, with auth token)
                const response = await axios.get('/api/music', {
                    headers: { Authorization: `Bearer ${authToken}` } // Use authToken from context
                });
                setMusicList(response.data.music); // Adjust based on your API response structure
                setFilteredMusicList(response.data.music); // Initially, filtered list is same as full list
                setLoading(false);
            } catch (err) {
                console.error("Error fetching music:", err);
                setError(err.message || "Failed to load music.");
                setLoading(false);
            }
        };

        fetchMusic();
    }, [authToken]); // Fetch music on component mount, re-fetch if authToken changes

    useEffect(() => {
        // Implement search filtering logic here based on searchQuery and musicList
        const filtered = musicList.filter(music =>
            music.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (music.artist && music.artist.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredMusicList(filtered);
    }, [searchQuery, musicList]);


    const handleUploadSuccess = (newMusic) => {
        // Placeholder: Re-fetch music list to update UI. In real app, optimize by adding newMusic to state directly.
        // You can also optimize by directly adding `newMusic` to `musicList` and `filteredMusicList` states instead of refetching.
        fetchMusicList(); // Re-fetch to update list.  For better UX, directly update state instead of re-fetching
    };

    const fetchMusicList = async () => { // Re-fetch function
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/music', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setMusicList(response.data.music);
            setFilteredMusicList(response.data.music);
            setLoading(false);
        } catch (err) {
            console.error("Error re-fetching music:", err);
            setError(err.message || "Failed to reload music.");
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
                <Heading as="h2" size="lg">Your Music</Heading>
                <Button colorScheme="teal" onClick={onUploadModalOpen} fontWeight="medium">Upload Music</Button>
            </Flex>

            <MusicSearch onSearchChange={setSearchQuery} /> {/* Search Bar */}

            <MusicUploadModal isOpen={isUploadModalOpen} onClose={onUploadModalClose} onUploadSuccess={handleUploadSuccess} />

            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={6} mt={6}>
                {filteredMusicList.map(music => (
                    <MusicCard key={music._id} music={music} onMusicDeleted={fetchMusicList} /> // Pass fetch function to MusicCard for refresh
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default MusicList;