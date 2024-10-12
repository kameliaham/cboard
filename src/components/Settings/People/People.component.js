import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import TextField from '@material-ui/core/TextField';

import FullScreenDialog from '../../UI/FullScreenDialog';
import messages from './People.messages';
import UserIcon from '../../UI/UserIcon';
import DeleteIcon from '@material-ui/icons/Delete';
import '../Settings.css';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const propTypes = {
  /**
   * Callback fired when clicking the back button
   */
  onClose: PropTypes.func,
  /**
   * Callback fired when clicking the logout button
   */
  logout: PropTypes.func.isRequired,
  /**
   * flag for user
   */
  isLogged: PropTypes.bool.isRequired,
  /**
   * Name of user
   */
  name: PropTypes.string.isRequired,
  /**
   * User email
   */
  email: PropTypes.string.isRequired,
  /**
   * User birthdate
   */
  birthdate: PropTypes.string.isRequired,
  onDeleteAccount: PropTypes.func,
  profession: PropTypes.string.isRequired,
  orthophonisteInfo: PropTypes.object,
  patientsWithSameMatricule: PropTypes.array,
  matricule: PropTypes.string,
  fetchData: PropTypes.func
};

const defaultProps = {
  name: '',
  email: '',
  birthdate: '',
  location: { country: null, countryCode: null },
  profession: '',
  matricule: '',
  orthophonisteInfo: null,
  patientsWithSameMatricule: []
};

const People = ({
  onClose,
  isLogged,
  logout,
  name,
  email,
  birthdate,
  location: { country, countryCode },
  profession,
  matricule,
  onChangePeople,
  onSubmitPeople,
  onDeleteAccount,
  orthophonisteInfo,
  patientsWithSameMatricule,
  fetchData,
  onSearchChange
}) => {
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [errorDeletingAccount, setErrorDeletingAccount] = useState(false);

  const handleCloseDeleteDialog = () => {
    setOpenDeleteConfirmation(false);
  };

  const handleDeleteConfirmed = async () => {
    setIsDeletingAccount(true);
    setErrorDeletingAccount(false);
    try {
      await onDeleteAccount();
      setIsDeletingAccount(false);
    } catch (error) {
      console.error(error);
      setIsDeletingAccount(false);
      setErrorDeletingAccount(true);
    }
  };

  useEffect(
    () => {
      fetchData();
    },
    [profession, matricule]
  );

  console.log('patiennntn', patientsWithSameMatricule);

  return (
    <div className="People">
      <FullScreenDialog
        open
        title={<FormattedMessage {...messages.people} />}
        onClose={onClose}
        onSubmit={onSubmitPeople}
        disableSubmit={!isLogged}
      >
        <Paper>
          <List>
            <ListItem>
              <div className="Settings__UserIcon__Container">
                <UserIcon />
              </div>
              <ListItemText primary={name} />
              <ListItemSecondaryAction className="Settings--secondaryAction">
                <Button
                  disabled={!isLogged}
                  variant="outlined"
                  color="primary"
                  onClick={logout}
                  component={Link}
                  to="/"
                >
                  <FormattedMessage {...messages.logout} />
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary={<FormattedMessage {...messages.name} />}
                secondary={<FormattedMessage {...messages.nameSecondary} />}
              />
              <ListItemSecondaryAction className="Settings--secondaryAction">
                <TextField
                  disabled={!isLogged}
                  id="user-name"
                  label={<FormattedMessage {...messages.name} />}
                  value={name}
                  margin="normal"
                  onChange={onChangePeople('name')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary={<FormattedMessage {...messages.email} />}
                secondary={<FormattedMessage {...messages.emailSecondary} />}
              />
              <ListItemSecondaryAction className="Settings--secondaryAction">
                <TextField
                  className="Settings--secondaryAction--textField"
                  disabled={true} // Replace with `{!isLogged}` untill fix issue #140 on cboard-api
                  id="user-email"
                  label={<FormattedMessage {...messages.email} />}
                  value={email}
                  margin="normal"
                  onChange={onChangePeople('email')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary={<FormattedMessage {...messages.birthdate} />}
                secondary={
                  <FormattedMessage {...messages.birthdateSecondary} />
                }
              />
              <ListItemSecondaryAction className="Settings--secondaryAction">
                <TextField
                  className="Settings--secondaryAction--textField"
                  disabled={!isLogged}
                  id="user-birthdate"
                  label={<FormattedMessage {...messages.birthdate} />}
                  type="date"
                  value={birthdate}
                  InputLabelProps={{
                    shrink: true
                  }}
                  onChange={onChangePeople('birthdate')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            {/* Champ Profession */}
            <ListItem>
              <ListItemText
                primary={<FormattedMessage {...messages.profession} />}
                secondary={
                  <FormattedMessage {...messages.professionSecondary} />
                }
              />
              <ListItemSecondaryAction className="Settings--secondaryAction">
                <TextField
                  disabled={true}
                  id="user-profession"
                  label={<FormattedMessage {...messages.profession} />}
                  value={profession}
                />
              </ListItemSecondaryAction>
            </ListItem>
            {/* Champ Matricule */}
            <ListItem>
              <ListItemText
                primary={<FormattedMessage {...messages.matricule} />}
                secondary={
                  <FormattedMessage {...messages.matriculeSecondary} />
                }
              />
              <ListItemSecondaryAction className="Settings--secondaryAction">
                <TextField
                  disabled={!isLogged || profession === 'orthophoniste'}
                  id="user-matricule"
                  label={<FormattedMessage {...messages.matricule} />}
                  value={matricule}
                  onChange={onChangePeople('matricule')}
                  helperText={
                    profession === 'orthophoniste'
                      ? 'Le matricule ne peut pas être modifié'
                      : ''
                  }
                />
              </ListItemSecondaryAction>
            </ListItem>
            {country && (
              <ListItem>
                <ListItemText
                  primary={<FormattedMessage {...messages.location} />}
                />
                <ListItemSecondaryAction className="Settings--secondaryAction">
                  <TextField
                    className="Settings--secondaryAction--textField"
                    disabled={true}
                    id="user-location"
                    label={<FormattedMessage {...messages.location} />}
                    value={country}
                    margin="normal"
                    country-code={countryCode}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            )}
            {isLogged && (
              <ListItem>
                <ListItemText
                  primary={
                    <FormattedMessage {...messages.deleteAccountPrimary} />
                  }
                  secondary={
                    <FormattedMessage {...messages.deleteAccountSecondary} />
                  }
                  className={'list_item_left'}
                />
                <ListItemSecondaryAction className="Settings--secondaryAction">
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<DeleteIcon />}
                    className={'delete_button'}
                    onClick={() => {
                      setOpenDeleteConfirmation(true);
                    }}
                  >
                    <FormattedMessage {...messages.deleteAccountPrimary} />
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            )}
          </List>
        </Paper>

        <Paper style={{ marginTop: '30px' }}>
          {profession === 'patient' && matricule && (
            <>
              {orthophonisteInfo && (
                <List>
                  <ListItem>
                    <ListItemText
                      primary={`Vous suivez chez l'orthophoniste : ${
                        orthophonisteInfo.name
                      }`}
                      secondary={`Email : ${orthophonisteInfo.email}`}
                    />
                  </ListItem>
                </List>
              )}
            </>
          )}
          {profession === 'orthophoniste' && (
            <>
              {patientsWithSameMatricule.length > 0 && (
                <List style={{ margin: '50px' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      marginBottom: '30px',
                      marginTop: '30px',
                      fontWeight: 'bold'
                    }}
                  >
                    Liste des Patients
                  </div>
                  <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <input
                      type="text"
                      placeholder="Rechercher par nom, prénom ou email"
                      onChange={onSearchChange}
                      style={{
                        padding: '10px 40px 10px 10px',
                        width: '100%',
                        fontSize: '16px'
                      }}
                    />
                    <i
                      className="fas fa-search"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        color: '#aaa',
                        fontSize: '20px'
                      }}
                    />
                  </div>

                  {patientsWithSameMatricule.map(patient => (
                    <ListItem
                      key={patient.id}
                      style={{
                        padding: '10px 0',
                        borderBottom: '1px solid #ccc'
                      }}
                    >
                      <ListItemText
                        primary={patient.name}
                        style={{ fontWeight: '600', fontSize: '24px' }}
                      />
                      <ListItemText
                        primary={`Email : ${patient.email}`}
                        secondary={`Dernière authentification : ${formatDate(
                          patient.lastlogin
                        )}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </Paper>
        <DeleteConfirmationDialog
          open={openDeleteConfirmation}
          handleClose={handleCloseDeleteDialog}
          handleDeleteConfirmed={handleDeleteConfirmed}
          isDeletingAccount={isDeletingAccount}
          errorDeletingAccount={errorDeletingAccount}
        />
      </FullScreenDialog>
    </div>
  );
};

const formatDate = dateString => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

People.propTypes = propTypes;
People.defaultProps = defaultProps;

export default People;
