import axios from 'axios';
import { BASE_URL_API } from '../store';

export const ordersApi = {
  list: () => async () => {
    const response = await axios.get('/order', {
      baseURL: BASE_URL_API,
    });
    if (response.statusText === 'OK' || response.status === 200) {
      return { data: response.data };
    } else {
      throw response.status;
    }
  },

  item: (id) => async () => {
    const response = await axios.get(`/order/${id}`, {
      baseURL: BASE_URL_API,
    });
    if (response.statusText === 'OK' || response.status === 200) {
      return { data: response.data };
    } else {
      throw response.status;
    }
  },

  submit: (data, token) => async () => {
    const response = await axios.post('/order', data, {
      baseURL: BASE_URL_API,
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (response.statusText === 'OK' || response.status === 204) {
      return { data: response.data };
    } else {
      throw response.status;
    }
  },
};
