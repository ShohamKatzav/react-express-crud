import React from 'react';
import { Link } from 'react-router-dom';

function AboutPage() {
    return (
        <div>
            <h1>About Todo App</h1>
            <p>Welcome to Todo App</p>
            <p> Let's Discover the power of Todo App! We'll guide you through what you can do:</p>

            <h2>Key Features</h2>
            <ul className='left-align-text'>
                <li>Create, Read, Update, and Delete (CRUD) operations for your individual to-do lists.</li>
                <li>Secure authentication using Auth0 to protect your data and ensure user privacy.</li>
                <li>Integration with Express, MongoDB and Node.js for efficient data storage and retrieval.</li>
            </ul>

            <h2>Getting Started</h2>
            <p>
                To make the most of our website, follow these steps:
            </p>
            <ol className='left-align-text'>
                <li>Sign up or log in using your preferred identity provider through our secure Auth0 authentication.</li>
                <li>Create your personal to-do lists and start adding tasks.</li>
                <li>Use the CRUD operations to manage your tasks - add new ones, mark them as completed, update their details, or delete them.</li>
                <li>Organize your tasks efficiently to stay productive and on top of your goals.</li>
            </ol>

            <h2>Authentication with Auth0</h2>
            <p>
                Our website uses Auth0 for authentication, ensuring a secure login experience for our users. <br />
                You can log in using your preferred identity provider, and your data is protected with industry-standard security practices.
            </p>

            <h2>Technologies Used</h2>
            <p>
                We've built this website using a combination of modern technologies, including React for the frontend, MongoDB for data storage, and Node.js for the backend. <br />
                This stack allows us to provide a smooth and reliable user experience.
            </p>
            <p>
                We hope you enjoy using our website and find it helpful for managing your to-do lists. <br />
                If you have any questions or feedback, don't hesitate to <Link to="/contact">Contact</Link>.
            </p>
        </div>
    );
}

export default AboutPage;