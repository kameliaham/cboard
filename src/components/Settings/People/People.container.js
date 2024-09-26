import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logout } from '../../Account/Login/Login.actions';
import { updateUserData } from '../../App/App.actions';
import People from './People.component';
import { getUser, isLogged } from '../../App/App.selectors';
import API from '../../../api';

import { isAndroid } from '../../../cordova-util';

export class PeopleContainer extends PureComponent {
  static propTypes = {
    history: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
  };

  state = {
    name: this.props.user.name,
    email: this.props.user.email,
    birthdate: this.props.user.birthdate,
    profession: this.props.user.profession,
    matricule: this.props.user.matricule || '',
    orthophonisteInfo: null,
    patientsWithSameMatricule: [],
    searchTerm: '',
    filteredPatients: []
  };

  handleChange = name => event => {
    this.setState({
      ...this.state,
      [name]: event.target.value
    });
  };

  handleSubmit = async () => {
    try {
      await API.updateUser({
        id: this.props.user.id,
        name: this.state.name,
        email: this.state.email,
        birthdate: this.state.birthdate,
        profession: this.state.profession,
        matricule: this.state.matricule
      });

      this.props.updateUserData({
        ...this.props.user,
        name: this.state.name,
        email: this.state.email,
        birthdate: this.state.birthdate,
        profession: this.state.profession,
        matricule: this.state.matricule
      });

      // Réinitialiser l'erreur et peut-être donner un feedback de succès
      this.setState({ error: null });
    } catch (e) {
      console.log(
        'Erreur lors de la soumission:',
        e.response?.data?.message || e.message
      );
      this.setState({ error: e.response?.data?.message || e.message }); // Afficher le message d'erreur
      console.error(e.message);
    }
  };

  fetchData = async () => {
    try {
      const { profession, matricule } = this.state;
      if (profession === 'patient' && matricule) {
        const responseOrthophoniste = await API.getOrthoMatri(matricule);
        if (
          Array.isArray(responseOrthophoniste) &&
          responseOrthophoniste.length > 0
        ) {
          this.setState({ orthophonisteInfo: responseOrthophoniste[0] });
        } else {
          this.setState({ orthophonisteInfo: null });
        }
      } else if (profession === 'orthophoniste') {
        const responsePatients = await API.getMypatients(matricule);
        if (Array.isArray(responsePatients)) {
          this.setState({ patientsWithSameMatricule: responsePatients });
        } else {
          console.warn('Response is not an array:', responsePatients);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  handleLogout = () => {
    if (isAndroid()) {
      window.FirebasePlugin.unregister();
      window.facebookConnectPlugin.logout(
        function(msg) {
          console.log('disconnect facebook msg' + msg);
        },
        function(msg) {
          console.log('error facebook disconnect msg' + msg);
        }
      );
    }
    this.props.logout();
  };

  handleDeleteAccount = async () => {
    try {
      const data = await API.deleteAccount();
      this.handleLogout();
      this.props.history.push('/login-signup/');
      return data;
    } catch (error) {
      throw Error(error);
    }
  };

  handleSearchChange = event => {
    const searchTerm = event.target.value;
    this.setState({ searchTerm });

    const filteredPatients = this.state.patientsWithSameMatricule.filter(
      patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.setState({ filteredPatients });
  };

  render() {
    const { history, location } = this.props;
    const {
      orthophonisteInfo,
      patientsWithSameMatricule,
      searchTerm,
      filteredPatients
    } = this.state;
    const displayedPatients = searchTerm
      ? filteredPatients
      : patientsWithSameMatricule;

    return (
      <People
        onClose={history.goBack}
        isLogged={this.props.isLogged}
        logout={this.handleLogout}
        name={this.state.name}
        email={this.state.email}
        birthdate={this.state.birthdate}
        profession={this.state.profession}
        matricule={this.state.matricule}
        orthophonisteInfo={orthophonisteInfo}
        patientsWithSameMatricule={displayedPatients}
        location={location}
        onChangePeople={this.handleChange}
        onSubmitPeople={this.handleSubmit}
        onDeleteAccount={this.handleDeleteAccount}
        fetchData={this.fetchData}
        onSearchChange={this.handleSearchChange}
      />
    );
  }
}

const mapStateToProps = state => {
  const userIsLogged = isLogged(state);
  const user = getUser(state);
  const location = userIsLogged
    ? {
        country: user?.location?.country,
        countryCode: user?.location?.countryCode
      }
    : {
        country: state.app.unloggedUserLocation?.country,
        countryCode: state.app.unloggedUserLocation?.countryCode
      };
  return {
    isLogged: userIsLogged,
    user: user,
    location: location
  };
};

const mapDispatchToProps = {
  logout: logout,
  updateUserData: updateUserData
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PeopleContainer);
