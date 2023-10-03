import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from './logoutButton';
import LoginButton from './loginButton';
import './Navbar.css';

function Navbar() {
    const { isAuthenticated, isLoading } = useAuth0();


    return isLoading ? null : (
        <nav className="navbar">
            <div className="logo">
                <Link to="/">Todo App</Link>
            </div>
            <ul className="nav-links">
                <li><Link to="">Home</Link></li>
                {isAuthenticated &&
                    (<li><Link to="profile">Profile</Link></li>)
                }
                <li><Link to="contact">Contact</Link></li>
                <li><Link to="about">About</Link></li>

            </ul>
            <ul className="nav-links">
                {isAuthenticated ? (
                    <li><LogoutButton /></li>
                ) : (
                    <li><LoginButton /></li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;