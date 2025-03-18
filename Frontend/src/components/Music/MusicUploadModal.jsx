import React, { useState } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    FormControl, FormLabel, Input, Button, VStack, Stack, useDisclosure, useToast
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const MusicUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [audioFile, setAudioFile] = useState(null);
    const [albumArt, setAlbumArt] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [genre, setGenre] = useState('');
    const [year, setYear] = useState('');
    const [uploading, setUploading] = useState(false);
    const toast = useToast();
    const { authToken } = useAuth(); // Get authToken from context

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData();
        formData.append('audioFile', audioFile);
        if (albumArt) {
            formData.append('albumArt', albumArt);
        }
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('album', album);
        formData.append('genre', genre);
        formData.append('year', year);

        try {
            const response = await axios.post('/api/music/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}` // Use authToken from context
                }
            });
            console.log("Upload successful:", response.data);
            toast({
                title: 'Music uploaded.',
                description: `"${response.data.music.title}" uploaded successfully.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onUploadSuccess(response.data.music); // Callback to update music list
            onClose(); // Close the modal
        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: 'Upload failed.',
                description: error.response?.data?.message || 'Something went wrong during upload.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Upload New Music</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack as="form" onSubmit={handleSubmit} spacing={6} width="full">
                        <FormControl id="audioFile" required>
                            <FormLabel>Audio File</FormLabel>
                            <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />
                        </FormControl>

                        <FormControl id="albumArt">
                            <FormLabel>Album Art (Optional)</FormLabel>
                            <Input type="file" accept="image/*" onChange={(e) => setAlbumArt(e.target.files[0])} />
                        </FormControl>

                        <Stack direction="row" spacing={4} width="full">
                            <FormControl id="title" isRequired>
                                <FormLabel>Title</FormLabel>
                                <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </FormControl>
                            <FormControl id="artist">
                                <FormLabel>Artist</FormLabel>
                                <Input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} />
                            </FormControl>
                        </Stack>

                        <Stack direction="row" spacing={4} width="full">
                            <FormControl id="album">
                                <FormLabel>Album</FormLabel>
                                <Input type="text" value={album} onChange={(e) => setAlbum(e.target.value)} />
                            </FormControl>
                            <FormControl id="genre">
                                <FormLabel>Genre</FormLabel>
                                <Input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} />
                            </FormControl>
                            <FormControl id="year">
                                <FormLabel>Year</FormLabel>
                                <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
                            </FormControl>
                        </Stack>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button mr={3} onClick={onClose} fontWeight="medium">Cancel</Button>
                    <Button colorScheme="teal" type="submit" isLoading={uploading} fontWeight="medium">Upload</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default MusicUploadModal;