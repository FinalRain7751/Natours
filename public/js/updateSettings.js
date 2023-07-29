'use strict';
import { URL } from './index';
const axios = require('../../node_modules/axios/dist/browser/axios.cjs');

import { showAlert } from './alerts';

// type is either 'password' or 'data'
// data is an object
export const updateSettings = async (data, type) => {
  try {
    const url = `${URL}/api/v1/users/${
      type === 'password' ? 'updateMyPassword' : 'updateMe'
    }`;

    const message = `${
      type === 'password' ? 'Password' : 'Data'
    } updated successfully!`;

    const res = await axios({
      method: 'PATCH',
      url: url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', message);
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
