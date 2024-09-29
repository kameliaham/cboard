import axios from 'axios';
import get from 'lodash/fp/get';

import { API_URL } from '../../../constants';

export function signUp(formValues) {
  const endpoint = `${API_URL}user`;
  console.log(endpoint)
  return axios.post(endpoint, formValues).then(get('data'));
}
