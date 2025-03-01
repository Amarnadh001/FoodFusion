import React from 'react';
import { GoogleLogin } from '@react-oauth/google'; // Only import GoogleLogin, not GoogleOAuthProvider

const GoogleSignIn = ({ onLoginSuccess, onLoginFailure }) => {
  const clientId = '612337810337-j63ol0chrh0van60288aliue64tbr085.apps.googleusercontent.com'; // Your Google OAuth client ID

  const handleLoginSuccess = (response) => {
    const googleToken = response.tokenId; // Get the Google token from the response
    onLoginSuccess(googleToken); // Handle success in the parent component
  };

  const handleLoginFailure = (error) => {
    console.error('Google Login Error:', error);
    onLoginFailure(error); // Handle failure
  };

  return (
    <div className="google-sign-in">
      <GoogleLogin
        clientId={clientId}
        onSuccess={handleLoginSuccess}
        onFailure={handleLoginFailure}
        cookiePolicy="single_host_origin"
        theme="dark"
        buttonText="Login with Google"
        isSignedIn={false} // Set to true to auto-sign in users
      />
    </div>
  );
};

export default GoogleSignIn;
