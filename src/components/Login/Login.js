import React, { useContext, useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { UserContext } from '../../App';
import { useHistory, useLocation } from 'react-router';
import './Login.css';
import { Button, ButtonGroup, Card, Checkbox, FormControl, FormControlLabel,TextField } from '@material-ui/core';
const Login = () => {
    const [loggedInUser, setLoggedInUser] = useContext(UserContext);
    const [user, setUser] = useState({
        isSignedIn: false,
        name: '',
        password: '',
        email: '',
        error: '',
        success: false

    });
    const [newUser, setNewUser] = useState(false);
    let history = useHistory();
    let location = useLocation();
    let { from } = location.state || { from: { pathname: "/" } };
    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }
    const handleGoogleSignIn = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth()
            .signInWithPopup(provider)
            .then((result) => {
                /** @type {firebase.auth.OAuthCredential} */
                const { displayName, email } = result.user;
                console.log(displayName, email);
                const signedInUser = {name: displayName, email: email}
                setLoggedInUser(signedInUser);
                storeAuthToken();

            }).catch((error) => {

                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorMessage, errorCode);

            });
    }
    const storeAuthToken = () => {
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
          sessionStorage.setItem('token', idToken);
           history.replace(from);
        }).catch(function (error) {
            // Handle error
        });
    }
    const handleFacebookSignIn = () => {
        const provider = new firebase.auth.FacebookAuthProvider();

        firebase
            .auth()
            .signInWithPopup(provider)
            .then((result) => {
                /** @type {firebase.auth.OAuthCredential} */
                var { displayName, email } = result.user;
                console.log(displayName, email);
                const signedInUser = {
                    name: displayName,
                    email: email
                }
                setLoggedInUser(signedInUser);
                history.replace(from);
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorMessage, errorCode);
            });
    }
    const handleBlur = (event) => {
        let isFormValid = true;
        if (event.target.name === 'email') {
            isFormValid = /\S+@\S+\.\S+/.test(event.target.value);
        }
        if (event.target.name === "password") {
            const passwordLength = event.target.value.length > 6;
            const hasNumber = /\d{1}/.test(event.target.value);
            isFormValid = passwordLength && hasNumber;
        }
        if (isFormValid) {
            const newUserInfo = { ...user };
            newUserInfo[event.target.name] = event.target.value;
            setUser(newUserInfo);
        }
    }
    const handleSubmit = (e) => {
        if (newUser && user.email && user.password) {
            firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
                .then((res) => {
                    const newUserInfo = { ...user };
                    newUserInfo.success = true;
                    newUserInfo.error = '';
                    setUser(newUserInfo);
                    setLoggedInUser(newUserInfo);
                    history.replace(from);
                })
                .catch((error) => {
                    const newUserInfo = { ...user };
                    newUserInfo.success = false;
                    newUserInfo.error = error.message;
                    setUser(newUserInfo);
                    setLoggedInUser(newUserInfo);
                    history.replace(from);
                });
        }
        if (!newUser && user.email && user.password) {
            firebase.auth().signInWithEmailAndPassword(user.email, user.password)
                .then((res) => {
                    const newUserInfo = { ...user };
                    newUserInfo.success = true;
                    newUserInfo.error = '';
                    setUser(newUserInfo);
                    setLoggedInUser(newUserInfo);
                    // history.replace(from);
                })
                .catch((error) => {
                    const newUserInfo = { ...user };
                    newUserInfo.success = false;
                    newUserInfo.error = error.message;
                    setUser(newUserInfo);
                    setLoggedInUser(newUserInfo);
                    history.replace(from);
                });
        }
        e.preventDefault();

    }
    return (
        <div className="login-form">

            <Card style={{ padding: '20px', margin: '20px 0' }}>
                <form onSubmit={handleSubmit}>
                    <FormControl>
                        {newUser && <TextField label="Name" onChange={handleBlur} name="name" placeholder="Enter Name" fullWidth required></TextField>}
                        <TextField type="text" label="Email" onChange={handleBlur} name="email" placeholder="Enter Email Address" fullWidth required></TextField>
                        <TextField type="password" label="password" onChange={handleBlur} name="password" placeholder="Enter Password" fullWidth required></TextField>
    
                        <FormControlLabel
                            control={
                                <Checkbox
                                    onChange={() => setNewUser(!newUser)}
                                    name="newUser"
                                    color="primary"
                                />
                            }
                            label="Sign Up if you new here"
                            htmlFor="newUser"
                        />
                        <Button type="submit" style={{ margin: '15px 0' }} size="large" variant="contained" color="primary">{newUser ? 'Sign Up' : 'Sign In'}</Button>
                        <p>Or Login With Social Account</p>
                        <p style={{ color: 'red' }}>{user.error}</p>
                        {user.success && <p style={{ color: 'green' }}>User {newUser ? 'Created' : 'Logged In'} Successfully</p>}
                        <ButtonGroup size="large" color="primary" aria-label="large outlined primary button group">
                            <Button onClick={handleGoogleSignIn}>Google</Button>
                            <Button onClick={handleFacebookSignIn}>Facebook</Button>
                        </ButtonGroup>
                    </FormControl>
                </form>
            </Card>
        </div>
    );
};

export default Login;