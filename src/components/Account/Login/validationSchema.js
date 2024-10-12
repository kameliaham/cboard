import * as yup from 'yup';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email _______')
    .required('Required'),
  password: yup.string().required('Required')
});

export default validationSchema;
