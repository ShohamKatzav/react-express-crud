import React from "react";
import LoginButton from "../components/loginButton"

const LoginPage = () => {

    return (
        <>
            <h1>To view your tasks, please log in.</h1>
            <button className="login-btn"><LoginButton /></button>
        </>
    );
};

export default LoginPage;