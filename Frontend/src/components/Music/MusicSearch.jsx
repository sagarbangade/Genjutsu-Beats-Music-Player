import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const MusicSearch = ({ onSearchChange }) => {
    return (
        <InputGroup>
            <InputLeftElement
                pointerEvents="none"
                children={<SearchIcon color="gray.500" />}
            />
            <Input
                type="text"
                placeholder="Search music by title or artist..."
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </InputGroup>
    );
};

export default MusicSearch;