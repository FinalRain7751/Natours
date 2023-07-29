import 'core-js/stable';
import { login, logout } from './login';
import { displayMap } from './map';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
export const URL = 'http://localhost:8000';

console.log('Hello from parcel');

// if (module.hot) {
//   module.hot.accept();
// }

// DOM ELEMENTS
const map = document.querySelector('#map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateUserDataForm = document.querySelector('.form-user-data');
const updateUserPasswordForm = document.querySelector('.form-user-password');
const bookTourBtn = document.querySelector('#book-tour');

// DELEGATION
if (map) {
  const locations = JSON.parse(map.dataset.locations);
  console.log(locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (updateUserDataForm) {
  updateUserDataForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const form = new FormData();
    form.append('name', updateUserDataForm.querySelector('#name').value);
    form.append('email', updateUserDataForm.querySelector('#email').value);
    form.append('photo', updateUserDataForm.querySelector('#photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
  });
}

if (updateUserPasswordForm) {
  updateUserPasswordForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const currentPassword =
      updateUserPasswordForm.querySelector('#password-current').value;
    const newPassword = updateUserPasswordForm.querySelector('#password').value;
    const newPasswordConfirm =
      updateUserPasswordForm.querySelector('#password-confirm').value;
    await updateSettings(
      { currentPassword, newPassword, newPasswordConfirm },
      'password',
    );

    updateUserPasswordForm.querySelector('#password-current').value = '';
    updateUserPasswordForm.querySelector('#password').value = '';
    updateUserPasswordForm.querySelector('#password-confirm').value = '';

    document.querySelector('.btn--save-password').textContent = 'Updating...';
  });
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
