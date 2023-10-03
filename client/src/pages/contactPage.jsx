import React from 'react';

function ContactPage() {
    return (
        <>
            <h1>Contact Us</h1>
            <div className='left-align-text'>
                <p>If you have any questions or feedback, feel free to get in touch with us!</p>
                <li>
                    <strong>Email:</strong> shohamkatzav95@gmail.com
                </li>
                <li>
                    <strong>Phone:</strong> 052-3292847
                </li>
                <li>
                    <strong>Facebook:</strong>
                    <a href="https://www.facebook.com/shoham.katzav/" target="_blank"> Facebook Profile</a>
                </li>
                <li>
                    <strong>Linkedin:</strong>
                    <a href="https://www.linkedin.com/in/shoham-katzav/" target="_blank"> Linkedin Profile</a>
                </li>
                <h2>GitHub</h2>
                Explore more of my projects on my GitHub profile:
                <div className='margin-top'>
                    <a href="https://github.com/ShohamKatzav/" target="_blank">GitHub Profile</a>
                </div>
            </div >
        </>
    );
}

export default ContactPage;