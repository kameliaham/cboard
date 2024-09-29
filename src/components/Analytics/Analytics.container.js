import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { isArray } from 'lodash';

import AnalyticsComponent from './Analytics.component';
import { logout } from '../Account/Login/Login.actions';
import { getUser, isLogged } from '../App/App.selectors';
import { showNotification } from '../Notifications/Notifications.actions';
import API from '../../api';
import messages from './Analytics.messages';
import { isCordova } from '../../cordova-util';
import PremiumFeature from '../PremiumFeature';
import { getStore } from '../../store';


export class AnalyticsContainer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    isLogged: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    boards: PropTypes.array.isRequired,
    logout: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      days: 30,
      isFetching: false,
      usage: {
        max: 100,
        min: 0,
        data: Array.from(Array(30), () => 0)
      },

      categoryTotals: {
        navigation: {
          value: 0,
          title: props.intl.formatMessage(messages.navigationEvents)
        },
        speech: {
          value: 0,
          title: props.intl.formatMessage(messages.speechEvents)
        },
        edit: {
          value: 0,
          title: props.intl.formatMessage(messages.editingEvents)
        }
      },
      topUsed: { symbols: [], boards: [] }
    };
  }

  clientId = '';
  timerId = '';

  async componentDidMount() {
    const { intl, showNotification } = this.props;
    console.log('boards:', this.props.boards)
    this.setState({ isFetching: true });
    try {
      this.clientId = getStore().getState().app.userData.id;
      //const totals = await this.getTotals(this.state.days);
      const usage = await this.getUsage(this.state.days);
      const categoryTotals = await this.getCategoryTotals(this.state.days);
      const topUsed = await this.getTopUsed(this.state.days);
      this.setState({

        categoryTotals,
        usage,
        topUsed,
        isFetching: false
      });
    } catch (err) {
      this.setState({ isFetching: false });
      showNotification(intl.formatMessage(messages.loadingError));
      console.log(err.message);
    }
  }

  getSymbolSources() {
    try {
      const { boards } = this.props;
      const images = boards
        .map(board => {
          return isArray(board.tiles)
            ? board.tiles.map(tile => (tile ? tile.image : 'invalid'))
            : [];
        })
        .reduce(
          (accumulator, currentValue) => accumulator.concat(currentValue),
          []
        );
      const sources = ['arasaac', 'mulberry', 'cboard', 'globalsymbols'];
      const summary = images.reduce(function (all, image) {
        sources.forEach(source => {
          try {
            if (image.match(source)) {
              if (source in all) {
                all[source]++;
              } else {
                all[source] = 1;
              }
            }
          } catch (err) {
            //just skip the image in counting
          }
        });
        return all;
      }, {});
      const summaryData = Object.entries(summary).map(([key, value]) => {
        return {
          value: value,
          name: key
        };
      });
      return summaryData;
    } catch (err) {
      console.log(err.message);
      return [{ value: 0, name: 'No data' }];
    }
  }

  getGaClientIdFromCookie = () => {
    var nameEQ = '_ga=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0)
        return c.substring(nameEQ.length + 6, c.length);
    }
    return null;
  };

  getGaClientId = async () => {
    return new Promise((resolve, reject) => {
      this.timerId = setTimeout(() => {
        if (isCordova()) {
          resolve(this.getGaClientIdFromCookie());
        } else if (typeof window.gtag !== 'undefined') {
          window.gtag('get', 'G-B8WLK499TN', 'client_id', client_id => {
            resolve(client_id);
          });
        } else {
          reject(
            new Error({ message: 'Google analytics client id not found' })
          );
        }
      }, 800);
    });
  };

  async getUsage(days) {
    const request = {
      mobileView: isCordova(),
      clientId: this.clientId,
      startDate: `${days}daysAgo`,
      endDate: 'today',
      metric: 'averageSessionDuration',
      dimension: 'nthDay'
    };


    let template = Array.from(Array(days), () => 0);
    let usage = {
      max: 10,
      min: 0,
      data: template
    };
    try {
      const report = await API.analyticsReport([request]);
      console.log('kkkk', report)
      if (
        report &&
        report.reports &&
        report.reports.length >= 1 &&
        report.reports[0]['rows']
      ) {
        const data = report.reports[0].rows.map(row => {
          return {
            index: parseInt(row.dimensionValues[0].value),
            value: parseInt(row.metricValues[0].value) / 60
          };
        });
        data.forEach(value => {
          template[value.index] = value.value;
        });
        usage = {
          max: Math.ceil(Math.max(...data.map(item => item.value))),
          min: 0,
          data: template
        };
      }
    } catch (err) { console.log('hhh', err) }
    return usage;
  }

  async getTotals(days) {
    const baseData = {
      mobileView: isCordova(),
      clientId: this.clientId,
      startDate: `${days}daysAgo`,
      endDate: 'today',
      metric: 'eventCount',
      dimension: 'eventName',
      filter: ''
    };
    const fullRequest = [];
    fullRequest.push({
      ...baseData,
      filter: { name: 'eventName', value: 'Click Symbol' }
    });
    fullRequest.push({
      ...baseData,
      filter: { name: 'eventName', value: 'Click Output' }
    });
    fullRequest.push({
      ...baseData,
      filter: { name: 'eventName', value: 'Create Tile' }
    });
    fullRequest.push({
      ...baseData,
      filter: { name: 'eventName', value: 'Edit Tiles' }
    });
    fullRequest.push({
      ...baseData,
      filter: { name: 'eventName', value: 'Change Board' }
    });
    const report = await API.analyticsReport(fullRequest);

    const totals = {
      words: {
        ...this.state.totals.words,
        total: this.getReportTotal(report, 0),
        rows: this.getReportRows(report, 0, 'sound')
      },
      phrases: {
        ...this.state.totals.phrases,
        total: this.getReportTotal(report, 1),
        rows: this.getReportRows(report, 1, 'sound')
      },
      editions: {
        ...this.state.totals.editions,
        total:
          Number(this.getReportTotal(report, 2)) +
          Number(this.getReportTotal(report, 3)),
        rows: this.getReportRows(report, 2).concat(
          this.getReportRows(report, 3)
        )
      },
      boards: {
        ...this.state.totals.boards,
        total: this.getReportTotal(report, 4, 'rowCount'),
        rows: this.getReportRows(report, 4)
      }
    };
    return totals;
  }

  getReportTotal(report, index = 0, type = 'totals') {
    let total = 0;
    if (
      report &&
      report.reports &&
      report.reports.length >= index &&
      report.reports[index]['rows']
    ) {
      if (type === 'rowCount') {
        total = report.reports[index]['rowCount'];
      } else {

        total = report?.reports[index].rows[0]?.metricValues[0].value || 0
      }
    }
    return total;
  }

  getReportRows(report, index = 0, type = 'view', max = 10) {
    let rows = [];
    if (
      report &&
      report.reports &&
      report.reports.length >= index &&
      report.reports[index]['rows']
    ) {
      rows = report.reports[index]['rows'].slice(0, max).map(row => {
        return {
          name: row['dimensionValues'][0]['value'],
          total: row['metricValues'][0]['value'],
          type: type
        };
      });
    }
    return rows;
  }

  async getCategoryTotals(days) {
    const baseData = {
      mobileView: isCordova(),
      clientId: this.clientId,
      startDate: `${days}daysAgo`,
      endDate: 'today',
      metric: 'eventCount',
      dimension: 'customEvent:category',
      filter: ''
    };
    const fullRequest = [];
    fullRequest.push({
      ...baseData,
      filter: { name: 'customEvent:category', value: 'Navigation' }
    });
    fullRequest.push({
      ...baseData,
      filter: { name: 'customEvent:category', value: 'Speech' }
    });
    fullRequest.push({
      ...baseData,
      filter: { name: 'customEvent:category', value: 'Editing' }
    });

    const report = await API.analyticsReport(fullRequest);
    const totals = {
      navigation: {
        ...this.state.categoryTotals.navigation,
        value: this.getReportTotal(report, 0)
      },
      speech: {
        ...this.state.categoryTotals.speech,
        value: this.getReportTotal(report, 1)
      },
      edit: {
        ...this.state.categoryTotals.edit,
        value: this.getReportTotal(report, 2)
      }
    };
    return totals;
  }

  async getTopUsed(days) {
    const SymbolsbaseData = {
      mobileView: isCordova(),
      clientId: this.clientId,
      startDate: `${days}daysAgo`,
      endDate: 'today',
      metric: 'eventCount',
      dimension: 'customEvent:label',
      filter: ''

    };
    const SymbolsfullRequest = [];
    SymbolsfullRequest.push({
      ...SymbolsbaseData,
      filter: { name: 'eventName', value: 'Click Symbol' }

    });


    const SymbolsReport = await API.analyticsReport(SymbolsfullRequest);
    const symbols = SymbolsReport.reports[0].rows
      .filter(row => row.dimensionValues[0].value !== "(not set)")
      .map(row => {
        return {
          name: row.dimensionValues[0].value,
          total: parseInt(row.metricValues[0].value, 10)
        };
      });

    const BoardsbaseData = {
      mobileView: isCordova(),
      clientId: this.clientId,
      startDate: `${days}daysAgo`,
      endDate: 'today',
      metric: 'eventCount',
      dimension: 'pagePath',
      filter: ''

    };
    const BoardsfullRequest = [];
    BoardsfullRequest.push({
      ...BoardsbaseData

    });


    const BoardsReport = await API.analyticsReport(BoardsfullRequest);
    const idboards = BoardsReport.reports[0].rows
      .filter(row => row.dimensionValues[0].value.startsWith('/board/'))
      .map(row => {
        const name = row.dimensionValues[0].value?.split('/board/')[1];
        const total = parseInt(row.metricValues[0].value);



        return {
          name,
          total
        };
      });


    const boards = await this.getBoardsFromIds(this.props.boards, idboards)
    console.log('idboards:', idboards)
    console.log('boards: ', boards)




    return {
      boards,
      symbols
    };
  }

  async getBoardsFromIds(ExistingBoards, boards) {
    const NewArr = []
    boards
      .map(item => {

        const matchingBoard = ExistingBoards.find(board => board.id === item.name && board.id !== getStore().getState().app.userData.id);


        if (matchingBoard) {
          NewArr.push({
            name: matchingBoard.nameKey?.split('.').pop() || matchingBoard.name?.split('.').pop(),
            total: item.total
          });
        }


        ;
      })
    return NewArr


  }

  getTileFromLabel(label) {
    const { boards } = this.props;
    for (let i = 0; i < boards.length; i++) {
      for (let j = 0; j < boards[i].tiles.length; j++) {
        const tile = boards[i].tiles[j];
        if (
          (tile.label &&
            tile.label.trim().toLowerCase() === label.trim().toLowerCase()) ||
          (tile.labelKey &&
            tile.labelKey
              .split()
            [tile.labelKey.split().length - 1].trim()
              .toLowerCase() ===
            label
              .trim()
              .replace(' ', '')
              .toLowerCase())
        ) {
          return boards[i].nameKey;
        }
      }
    }
    return undefined;
  }

  onDaysChange = async days => {
    const { intl, showNotification } = this.props;
    this.setState({ isFetching: true });
    try {
      //const totals = await this.getTotals(days);
      const usage = await this.getUsage(days);
      const categoryTotals = await this.getCategoryTotals(days);
      const topUsed = this.getTopUsed(days);
      this.setState({
        days,

        categoryTotals,
        usage,
        topUsed,
        isFetching: false
      });
    } catch (err) {
      this.setState({ isFetching: false });
      showNotification(intl.formatMessage(messages.loadingError));
      console.log(err.message);
    }
  };

  render() {
    return (

      <AnalyticsComponent
        onDaysChange={this.onDaysChange}
        symbolSources={this.getSymbolSources()}
        days={this.state.days}
        totals={this.state.totals}
        categoryTotals={this.state.categoryTotals}
        usage={this.state.usage}
        topUsed={this.state.topUsed}
        isFetching={this.state.isFetching}
        {...this.props}
      />

    );
  }
}

const mapStateToProps = state => ({
  isLogged: isLogged(state),
  user: getUser(state),
  boards: state.board.boards
});

const mapDispatchToProps = {
  logout,
  showNotification
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AnalyticsContainer));
