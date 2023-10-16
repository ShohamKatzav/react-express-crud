import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from './loginButton';
import './Navbar.css';
import ProfileButton from './profileButton';

function Navbar() {
    const { isAuthenticated, isLoading } = useAuth0();


    return isLoading ? null : (
        <nav className="navbar">
            <div className="logo">
                <Link to="/">Todo App</Link>
            </div>
            <ul className="nav-links">
                <li><Link to="">Home</Link></li>
                <li><Link to="contact">Contact</Link></li>
                <li><Link to="about">About</Link></li>

            </ul>
            <ul className="nav-links-no-padding">
                {isAuthenticated ? (
                    <li><ProfileButton /></li>
                ) : (
                    <li className="nav-links"><LoginButton /></li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;