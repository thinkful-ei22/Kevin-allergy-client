import {API_BASE_URL} from '../config';
import jwtDecode from 'jwt-decode';
import {saveAuthToken, clearAuthToken, loadAuthToken} from '../local-storage';

export const AUTH_SET = 'AUTH_SET';
export const setAuthToken = token => ({
  type: AUTH_SET,
  token
});

export const CLEAR_AUTH = 'CLEAR_AUTH';
export const clearAuth = () => ({
  type: CLEAR_AUTH
});

export const AUTH_REQUEST = 'AUTH_REQUEST';
export const authRequest = () => ({
  type:AUTH_REQUEST
});

export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const authSuccess = user => ({
  type: AUTH_SUCCESS,
  user
});

export const REGISTER_ERROR = 'REGISTER_ERROR';
export const regisError = error => ({
  type: REGISTER_ERROR,
  error
});

export const LOGIN_ERROR = 'LOGIN_ERROR';
export const logiError = error => ({
  type: LOGIN_ERROR,
  error
});

export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const registerSuccess = status => ({
  type: REGISTER_SUCCESS,
  status
});

export const STAY_LOGGED_IN = 'STAY_LOGGED_IN';
export const setReduxTokenFrmLocalStore = authToken => ({
  type: STAY_LOGGED_IN,
  authToken
});


const storeAuthInfo = (authToken, dispatch) => {
  // console.log(authToken);
  const decodedToken = jwtDecode(authToken);
  // console.log(decodedToken, decodedToken.user.username);
  dispatch(setAuthToken(authToken));
  dispatch(authSuccess(decodedToken.user.username));
  saveAuthToken(authToken);
};

export const createUser = (email, username, password, history) => dispatch => {
  let resOk;
  dispatch(authRequest());
  // console.log('I\'m making a post request to the back-end to create a user');
  return fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers:{
      'content-type': 'application/json'
    },
    body: JSON.stringify({

      email,
      username,
      password,
    })
  })
    .then(res => {
      // console.log(res, 'test create user');
      resOk = res.ok;
      return res.json();
    })
    .then(res => {
      if (!resOk) {
        // console.log(res);
        return Promise.reject(res.message);
      }
      dispatch(registerSuccess(true));
      window.setTimeout(() => {history.push('/login');}, 5000);
      // return res.json();
    })
    .catch(err => {
      // console.log(err);
      dispatch(regisError(err));
    });
};

export const loginUser = (username, password, history) => dispatch => {
  dispatch(authRequest());
  // console.log('I\'m making a get request to the back-end');
  return fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers:{
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password,
    })
  })
    .then(res => {
      if(!res.ok){
        // console.log(res.statusText);
        return Promise.reject({message: 'Invalid username and/or password.'});
      }
      // console.log(res, 'test login user');
      return res.json();
    }).then(data => {
      // console.log(data);
      const {authToken} = data;
      // console.log(authToken);
      storeAuthInfo(authToken, dispatch);
      history.push('/add');
    })
    .catch(err => {
      dispatch(logiError(err));
    });
};

export const logoutUser = history => dispatch => {
  dispatch(clearAuth());
  clearAuthToken();
  history.push('/');
};

export const stayLoggedIn = () => dispatch => {
  const token = loadAuthToken();
  if(token){
    dispatch(setReduxTokenFrmLocalStore(token));
    const decodedLocalToken = jwtDecode(token);
    // console.log(decodedLocalToken, decodedLocalToken.user.username);
    dispatch(authSuccess(decodedLocalToken.user.username));
  }
};