import React from 'react';

const ContactPage = () => {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4 neon-text-shadow">Contact Us</h2>
            <p className="text-gray-300">
                We'd love to hear from you! If you have any questions, feedback, or need support, please don't hesitate to reach out.
            </p>
            <p className="text-gray-300 mt-4">
                Email us at: <a href="mailto:support@musicneon.com" className="text-blue-400 hover:underline neon-text-shadow">support@musicneon.com</a>
            </p>
            <p className="text-gray-300 mt-4">
                Follow us on social media for updates and more:
                {/* Add social media links as needed */}
            </p>
        </div>
    );
};

export default ContactPage;