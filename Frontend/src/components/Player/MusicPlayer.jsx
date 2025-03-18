import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, Spacer, Image } from '@chakra-ui/react';
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5); // 0 to 1
    const [isMuted, setIsMuted] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null); // Example track object: { _id, title, artist, audioFileUrl, albumArtUrl }

    const audioRef = useRef(null);

    useEffect(() => {
        if (currentTrack) {
            audioRef.current.src = currentTrack.audioFileUrl; // Set audio source when track changes
            audioRef.current.load(); // Load new source
            if (isPlaying) {
                audioRef.current.play().catch(error => console.error("Playback failed:", error)); // Autoplay if was playing
            }
        } else {
            audioRef.current.pause(); // Pause if no track
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        }
    }, [currentTrack, isPlaying]);

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(error => console.error("Playback failed:", error));
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (value) => {
        audioRef.current.currentTime = value;
        setCurrentTime(value);
    };

    const handleVolumeChange = (value) => {
        setVolume(value / 100); // Slider is 0-100, volume is 0-1
    };

    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
        audioRef.current.muted = !isMuted;
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const handleNextTrack = () => {
        // Implement logic to play the next track in playlist or queue
        console.log("Next Track");
        // Example: setCurrentTrack(nextTrackFromQueue);
    };

    const handlePrevTrack = () => {
        // Implement logic to play the previous track
        console.log("Previous Track");
        // Example: setCurrentTrack(prevTrackFromQueue);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <Box bg="gray.900" color="white" position="fixed" bottom={0} left={0} right={0} px={6} py={3} boxShadow="0px -2px 5px rgba(0, 0, 0, 0.3)">
            <Flex maxW="container.xl" mx="auto" align="center">
                {currentTrack && currentTrack.albumArtUrl ? (
                    <Image src={currentTrack.albumArtUrl} alt={currentTrack.title} boxSize="50px" borderRadius="md" mr={4} fallbackSrc="placeholder-album-art.png" />
                ) : (
                    <Box boxSize="50px" bg="gray.700" borderRadius="md" mr={4} />
                )}
                <Box flex="1">
                    <Text fontWeight="bold" noOfLines={1}>{currentTrack ? currentTrack.title : 'No track selected'}</Text>
                    <Text fontSize="sm" color="gray.400" noOfLines={1}>{currentTrack ? currentTrack.artist : ''}</Text>
                </Box>
                <Spacer />
                <Flex align="center">
                    <IconButton aria-label="Previous Track" icon={<FaBackward />} size="sm" colorScheme="gray" variant="ghost" onClick={handlePrevTrack} />
                    <IconButton aria-label={isPlaying ? "Pause" : "Play"} icon={isPlaying ? <FaPause /> : <FaPlay />} size="md" colorScheme="teal" onClick={handlePlayPause} />
                    <IconButton aria-label="Next Track" icon={<FaForward />} size="sm" colorScheme="gray" variant="ghost" onClick={handleNextTrack} />
                    <Slider
                        aria-label='volume-slider'
                        defaultValue={50}
                        min={0}
                        max={100}
                        width="80px"
                        ml={4}
                        onChange={handleVolumeChange}
                    >
                        <SliderTrack bg="gray.700">
                            <SliderFilledTrack bg="teal.500" />
                        </SliderTrack>
                        <SliderThumb boxSize={4} />
                    </Slider>
                    <IconButton aria-label={isMuted ? "Unmute" : "Mute"} icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />} size="sm" colorScheme="gray" variant="ghost" onClick={handleMuteToggle} ml={2} />
                </Flex>
            </Flex>
            <Slider
                aria-label='seek-slider'
                value={currentTime}
                min={0}
                max={duration}
                step={0.1}
                onChange={handleSeek}
                mt={2}
            >
                <SliderTrack bg="gray.700">
                    <SliderFilledTrack bg="teal.200" />
                </SliderTrack>
                <SliderThumb boxSize={3} />
            </Slider>
            <Flex justify="space-between" fontSize="sm" color="gray.400">
                <Text>{formatTime(currentTime)}</Text>
                <Text>{formatTime(duration)}</Text>
            </Flex>

            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleNextTrack} // Optional: handle track ending
            />
        </Box>
    );
};

export default MusicPlayer;