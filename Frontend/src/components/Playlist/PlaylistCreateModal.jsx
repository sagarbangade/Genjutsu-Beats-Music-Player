import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Textarea,
  useDisclosure,
  Checkbox,
  CheckboxGroup,
  Stack,
  SimpleGrid,
  Box,
  Image,
  Spinner,
  Text,
  Select,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import MusicCard from "../Music/MusicCard"; // Reusing MusicCard for selection
import { useAuth } from "../../AuthContext";

const PlaylistCreateModal = ({ isOpen, onClose, onPlaylistCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [userMusicList, setUserMusicList] = useState([]); // List of user's music to select from
  const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [loadingMusicList, setLoadingMusicList] = useState(true);
  const [errorMusicList, setErrorMusicList] = useState(null);
  const {
    isOpen: isUploadMusicModalOpen,
    onOpen: onUploadMusicModalOpen,
    onClose: onUploadMusicModalClose,
  } = useDisclosure();
  const toast = useToast();
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchUserMusic = async () => {
      try {
        setLoadingMusicList(true);
        setErrorMusicList(null);
        const response = await axios.get("/api/music", {
          headers: { Authorization: `Bearer ${authToken}` }, // Use authToken from context
        });
        setUserMusicList(response.data.music);
        setLoadingMusicList(false);
      } catch (err) {
        console.error("Error fetching user music for playlist creation:", err);
        setErrorMusicList(err.message || "Failed to load music list.");
        setLoadingMusicList(false);
      }
    };

    fetchUserMusic();
  }, [authToken, isOpen]); // Fetch user's music on modal open and when authToken changes

  const handleCheckboxChange = (values) => {
    setSelectedSongIds(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreatingPlaylist(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }
    formData.append("existingSongIds", JSON.stringify(selectedSongIds)); // Send selected song IDs

    try {
      const response = await axios.post("/api/playlists", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`, // Use authToken from context
        },
      });
      console.log("Playlist created:", response.data);
      toast({
        title: "Playlist created.",
        description: `Playlist "${response.data.playlist.name}" created successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onPlaylistCreated(response.data.playlist); // Callback to update playlist list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Playlist creation error:", error);
      toast({
        title: "Playlist creation failed.",
        description:
          error.response?.data?.message ||
          "Something went wrong during playlist creation.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCreatingPlaylist(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Playlist</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack as="form" onSubmit={handleSubmit} spacing={6} width="full">
            <FormControl id="playlistName" required>
              <FormLabel>Playlist Name</FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <FormControl id="playlistDescription">
              <FormLabel>Description (Optional)</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>

            <FormControl id="playlistCoverImage">
              <FormLabel>Cover Image (Optional)</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files[0])}
              />
            </FormControl>

            <FormControl id="selectSongs">
              <FormLabel>Select Existing Songs</FormLabel>
              {loadingMusicList ? (
                <Spinner size="md" />
              ) : errorMusicList ? (
                <Text color="red.500">{errorMusicList}</Text>
              ) : (
                <CheckboxGroup
                  colorScheme="teal"
                  onChange={handleCheckboxChange}
                >
                  <SimpleGrid
                    columns={{ sm: 1, md: 2 }}
                    spacing={4}
                    mt={2}
                    overflowY="auto"
                    maxHeight="300px"
                    border="1px solid"
                    borderColor="gray.200"
                    p={2}
                    borderRadius="md"
                  >
                    {userMusicList.map((music) => (
                      <Checkbox value={music._id} key={music._id}>
                        <Box display="flex" alignItems="center">
                          <Image
                            src={
                              music.albumArtUrl || "placeholder-album-art.png"
                            }
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
          <Button mr={3} onClick={onClose} fontWeight="medium">
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={creatingPlaylist}
            fontWeight="medium"
          >
            Create Playlist
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PlaylistCreateModal;
