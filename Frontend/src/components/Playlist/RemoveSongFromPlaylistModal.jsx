import React, { useState } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, VStack, Text, useToast, Spinner
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const RemoveSongFromPlaylistModal = ({ isOpen, onClose, playlistId, songIdToRemove, onSongRemoved }) => {
    const [removingSong, setRemovingSong] = useState(false);
    const toast = useToast();
    const { authToken } = useAuth();

    const handleRemoveSong = async () => {
        if (!songIdToRemove) return;

        setRemovingSong(true);
        try {
            const response = await axios.delete(`/api/playlists/${playlistId}/songs/${songIdToRemove}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}` // Use authToken from context
                }
            });
            console.log("Song removed from playlist:", response.data);
            toast({
                title: 'Song removed.',
                description: `Song removed from playlist successfully.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onSongRemoved(response.data.playlist); // Callback to update playlist details
            onClose(); // Close the modal
        } catch (error) {
            console.error("Error removing song from playlist:", error);
            toast({
                title: 'Failed to remove song.',
                description: error.response?.data?.message || 'Something went wrong while removing the song.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setRemovingSong(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Remove Song from Playlist?</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text mb={4}>Are you sure you want to remove this song from the playlist?</Text>
                </ModalBody>

                <ModalFooter>
                    <Button mr={3} onClick={onClose} fontWeight="medium">Cancel</Button>
                    <Button colorScheme="red" onClick={handleRemoveSong} isLoading={removingSong} fontWeight="medium">
                        {removingSong ? <Spinner size="sm" /> : "Remove Song"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default RemoveSongFromPlaylistModal;