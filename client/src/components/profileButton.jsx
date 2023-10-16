import { React, useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';
import LogoutButton from './logoutButton'

const ProfileButton = () => {
    const { user, isAuthenticated } = useAuth0();
    const [menuOpen, setMenuOpen] = useState(false);
    const MenuRef = useRef();

    useEffect(() => {
        const handler = (event) => {
            if (
                menuOpen &&
                !(MenuRef?.current?.contains(event.target))
            ) {
                setMenuOpen(prev => !prev);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
        };
    }, [menuOpen]);

    return isAuthenticated ? (
        <>
            <div ref={MenuRef} className="profile-btn">
                <button
                    className="mini-profile-photo toggle"
                    onClick={() => setMenuOpen(prev => !prev)}
                >
                    <img src={user.picture} alt={user.name} />
                </button>
                <ul className={`menu${menuOpen ? ' show-menu' : ''}`}>
                    <li><span>{user.nickname}</span></li>
                    <li><Link
                        to={"/profile"}
                        onClick={() => setMenuOpen(false)}
                    >
                        Profile Details
                    </Link></li>
                    <li><LogoutButton /></li>
                </ul>
            </div>
        </>) : null;


};

export default ProfileButton;