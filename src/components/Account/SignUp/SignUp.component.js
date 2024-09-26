import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Formik, ErrorMessage } from 'formik';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { TextField } from '../../UI/FormItems';
import LoadingIcon from '../../UI/LoadingIcon';
import validationSchema from './validationSchema';
import { signUp } from './SignUp.actions';
import messages from './SignUp.messages';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import './SignUp.css';

export class SignUp extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    isDialogOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isKeyboardOpen: PropTypes.bool,
    dialogWithKeyboardStyle: PropTypes.object
  };

  static defaultProps = {
    dialogWithKeyboardStyle: {}
  };

  state = {
    isSigningUp: false,
    signUpStatus: {},
    generatedMatricule: '' // Pour stocker le matricule généré
  };

  componentDidUpdate({ isDialogOpen }) {
    if (this.props.isDialogOpen && this.props.isDialogOpen !== isDialogOpen) {
      this.setState({ signUpStatus: {} });
    }
  }

  // Générer un matricule unique pour un orthophoniste
  generateMatricule = () => {
    const uniqueMatricule = `ORTHO-${Math.floor(Math.random() * 10000)}`;
    this.setState({ generatedMatricule: uniqueMatricule });
  };

  handleSubmit = values => {
    const {
      passwordConfirm,
      profession,
      matricule,
      generatedMatricule,
      ...formValues
    } = values;

    // Si la profession est orthophoniste, on utilise le matricule généré
    const finalMatricule =
      profession === 'orthophoniste'
        ? this.state.generatedMatricule
        : matricule;

    const formData = {
      ...formValues,
      profession,
      matricule: finalMatricule
    };

    this.setState({
      isSigningUp: true,
      signUpStatus: {}
    });

    signUp(formData)
      .then(signUpStatus => this.setState({ signUpStatus }))
      .catch(error => {
        const responseMessage = error?.response?.data?.message;
        const message = responseMessage
          ? responseMessage
          : this.props.intl.formatMessage(messages.noConnection);

        this.setState({
          signUpStatus: { success: false, message: message }
        });
      })
      .finally(() => this.setState({ isSigningUp: false }));
  };

  render() {
    const { signUpStatus, isSigningUp } = this.state;
    const { isDialogOpen, onClose, intl, dialogWithKeyboardStyle } = this.props;

    const { dialogStyle, dialogContentStyle } = dialogWithKeyboardStyle ?? {};

    const isButtonDisabled = isSigningUp || !!signUpStatus.success;

    return (
      <Dialog
        open={isDialogOpen}
        onClose={onClose}
        aria-labelledby="sign-up"
        style={dialogStyle}
      >
        <DialogTitle id="sign-up">
          <FormattedMessage {...messages.signUp} />
        </DialogTitle>
        <DialogContent style={dialogContentStyle}>
          <div
            className={classNames('SignUp__status', {
              'SignUp__status--error': !signUpStatus.success,
              'SignUp__status--success': signUpStatus.success
            })}
          >
            <Typography color="inherit">{signUpStatus.message}</Typography>
          </div>
          {signUpStatus && !signUpStatus.success && (
            <Formik
              onSubmit={this.handleSubmit}
              validationSchema={validationSchema}
              initialValues={{
                isTermsAccepted: false,
                profession: '',
                matricule: '',
                generatedMatricule: ''
              }}
            >
              {({ errors, values, handleChange, handleSubmit }) => (
                <form className="SignUp__form" onSubmit={handleSubmit}>
                  <TextField
                    name="name"
                    label={intl.formatMessage(messages.name)}
                    error={errors.name}
                    onChange={handleChange}
                  />
                  <TextField
                    name="email"
                    label={intl.formatMessage(messages.email)}
                    error={errors.email}
                    onChange={handleChange}
                  />
                  <TextField
                    type="password"
                    name="password"
                    label={intl.formatMessage(messages.createYourPassword)}
                    error={errors.password}
                    onChange={handleChange}
                  />
                  <TextField
                    type="password"
                    name="passwordConfirm"
                    label={intl.formatMessage(messages.confirmYourPassword)}
                    error={errors.passwordConfirm}
                    onChange={handleChange}
                  />
                  <Select
                    name="profession"
                    onChange={e => {
                      handleChange(e);
                      if (e.target.value === 'orthophoniste') {
                        this.generateMatricule();
                      }
                    }}
                    value={values.profession}
                    displayEmpty
                    error={errors.profession}
                  >
                    <MenuItem value="" disabled>
                      {intl.formatMessage(messages.profession)}
                    </MenuItem>
                    <MenuItem value="orthophoniste">Orthophoniste</MenuItem>
                    <MenuItem value="patient">Patient</MenuItem>
                  </Select>

                  {/* Demande de matricule pour les patients */}
                  {values.profession === 'patient' && (
                    <TextField
                      name="matricule"
                      label={intl.formatMessage(messages.enterMatricule)}
                      error={errors.matricule}
                      helperText={
                        errors.matricule ||
                        'Si vous avez un orthophoniste, entrez son matricule.'
                      }
                      onChange={handleChange}
                    />
                  )}

                  {/* Matricule généré pour les orthophonistes */}
                  {values.profession === 'orthophoniste' && (
                    <TextField
                      name="generatedMatricule"
                      label={intl.formatMessage(messages.yourMatricule)}
                      value={this.state.generatedMatricule}
                      onChange={handleChange}
                      helperText="Votre matricule unique."
                    />
                  )}

                  <FormControlLabel
                    control={
                      <Checkbox
                        type="checkbox"
                        name="isTermsAccepted"
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label={
                      <FormattedMessage
                        {...messages.agreement}
                        values={{
                          terms: (
                            <a
                              href="https://www.cboard.io/terms-of-use/"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {intl.formatMessage(messages.termsAndConditions)}
                            </a>
                          ),
                          privacy: (
                            <a
                              href="https://www.cboard.io/privacy/"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {intl.formatMessage(messages.privacy)}
                            </a>
                          )
                        }}
                      />
                    }
                  />
                  <ErrorMessage
                    name="isTermsAccepted"
                    component="p"
                    className="SignUp__status--error SignUp__termsError"
                  />

                  <DialogActions>
                    <Button
                      color="primary"
                      disabled={isButtonDisabled}
                      onClick={onClose}
                    >
                      <FormattedMessage {...messages.cancel} />
                    </Button>
                    <Button
                      type="submit"
                      disabled={isButtonDisabled}
                      variant="contained"
                      color="primary"
                    >
                      {isSigningUp && <LoadingIcon />}
                      <FormattedMessage {...messages.signMeUp} />
                    </Button>
                  </DialogActions>
                </form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}

export default injectIntl(SignUp);
