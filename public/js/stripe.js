const axios = require('../../node_modules/axios/dist/browser/axios.cjs');
const stripe = Stripe(
  'pk_test_51NYw64SECEBH0aTD26lG6JFdEkGqIggxuuwCNqb7EP641bftQmF1VTBCz1HNU5UIhIwL7m7nsjl369PtYuiG0qK4000NJ2SQyz',
);
import { showAlert } from './alerts';
import { URL } from './index';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `${URL}/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.error(err);
    showAlert('error', err);
  }
};
