'use strict';

import { URL } from './index';
import { showAlert } from './alerts';
const axios = require('../../node_modules/axios/dist/browser/axios.cjs');

export const login = async (email, password) => {
  try {
    console.log(`${URL}/api/v1/users/login`);
    const res = await axios({
      method: 'POST',
      url: `${URL}/api/v1/users/login`,
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `${URL}/api/v1/users/logout`,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', 'Error logging out.! Try again.');
  }
};
