import { React } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <h1>Loading ...</h1>;
  }
  return (
    isAuthenticated && (
      <>
        <h1>Hello {user.nickname}</h1>
        <div className="profile-info">
          <div className="profile-photo">
            <img src={user.picture} alt={user.name} />
          </div>
          <div className="big-margin-top left-align-text">
            {Object.keys(user).filter(key => key != "picture" && key != "nickname").map(key =>
              <li key={key}>{key}: {user[key]}</li>)
            }
          </div>
        </div>
      </>
    )
  );
};

export default ProfilePage;