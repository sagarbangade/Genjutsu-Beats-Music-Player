import React from 'react';

const AboutPage = () => {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-3xl font-bold text-pink-400 mb-4 neon-text-shadow">About Music Neon</h2>
            <p className="text-gray-300">
                Music Neon is your ultimate platform to upload, organize, and stream your favorite music tracks.
                Built with a passion for music and cutting-edge web technologies, we aim to provide a seamless and vibrant music experience.
            </p>
            <p className="text-gray-300 mt-4">
                Our stack includes React for a dynamic user interface, Tailwind CSS for stunning neon aesthetics,
                Express.js and Node.js for robust backend APIs, and MongoDB for scalable data storage.
            </p>
            <p className="text-gray-300 mt-4">
                Join us on this musical journey and light up your listening experience with Music Neon!
            </p>
        </div>
    );
};

export default AboutPage;