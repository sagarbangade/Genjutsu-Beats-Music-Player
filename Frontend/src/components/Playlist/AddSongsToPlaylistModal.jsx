import React, { useState, useEffect } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    FormControl, FormLabel, Button, VStack, Textarea, useDisclosure, Checkbox, CheckboxGroup,
    Stack, SimpleGrid, Box, Image, Spinner, Text, Select, useToast
} from '@chakra-ui/react';
import axios from 'axios';
import MusicCard from '../Music/MusicCard'; // Reusing MusicCard for selection
import { useAuth } from '../../AuthContext';

const AddSongsToPlaylistModal = ({ isOpen, onClose, playlistId, onSongsAdded }) => {
    const [userMusicList, setUserMusicList] = useState([]); // List of user's music to select from
    const [selectedSongIds, setSelectedSongIds] = useState([]);
    const [loadingMusicList, setLoadingMusicList] = useState(true);
    const [errorMusicList, setErrorMusicList] = useState(null);
    const [addingSongs, setAddingSongs] = useState(false);
    const toast = useToast();
    const { authToken } = useAuth();

    useEffect(() => {
        const fetchUserMusic = async () => {
            try {
                setLoadingMusicList(true);
                setErrorMusicList(null);
                const response = await axios.get('/api/music', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setUserMusicList(response.data.music);
                setLoadingMusicList(false);
            } catch (err) {
                console.error("Error fetching user music for adding to playlist:", err);
                setErrorMusicList(err.message || "Failed to load music list.");
                setLoadingMusicList(false);
            }
        };

        fetchUserMusic();
    }, [authToken, isOpen]); // Fetch user's music on modal open

    const handleCheckboxChange = (values) => {
        setSelectedSongIds(values);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAddingSongs(true);

        try {
            const response = await axios.post(`/api/playlists/${playlistId}/songs`, { songIds: selectedSongIds }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}` // Use authToken from context
                }
            });
            console.log("Songs added to playlist:", response.data);
            toast({
                title: 'Songs added.',
                description: `Songs added to playlist successfully.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onSongsAdded(response.data.playlist); // Callback to update playlist details
            onClose(); // Close the modal
        } catch (error) {
            console.error("Error adding songs to playlist:", error);
            toast({
                title: 'Failed to add songs.',
                description: error.response?.data?.message || 'Something went wrong while adding songs.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setAddingSongs(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add Songs to Playlist</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack as="form" onSubmit={handleSubmit} spacing={6} width="full">
                        <FormControl id="selectSongs">
                            <FormLabel>Select Songs to Add</FormLabel>
                            {loadingMusicList ? (
                                <Spinner size="md" />
                            ) : errorMusicList ? (
                                <Text color="red.500">{errorMusicList}</Text>
                            ) : (
                                <CheckboxGroup colorScheme="teal" onChange={handleCheckboxChange}>
                                    <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4} mt={2} overflowY="auto" maxHeight="400px" border="1px solid" borderColor="gray.200" p={2} borderRadius="md">
                                        {userMusicList.map(music => (
                                            <Checkbox value={music._id} key={music._id}>
                                                <Box display="flex" alignItems="center">
                                                    <Image
                                                        src={music.albumArtUrl || "placeholder-album-art.png"}
                                                        alt={music.title}
                                                        boxSize="40px"
                                                        mr={2}
                                                        borderRadius="md"
                                                        fallbackSrc="placeholder-album-art.png"
                                                    />
                                                    <Text fontWeight="medium">{music.title}</Text>
                                                </Box>
                                            </Checkbox>
                                        ))}
                                    </SimpleGrid>
                                </CheckboxGroup>
                            )}
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button mr={3} onClick={onClose} fontWeight="medium">Cancel</Button>
                    <Button colorScheme="blue" type="submit" isLoading={addingSongs} fontWeight="medium">Add Songs</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddSongsToPlaylistModal;