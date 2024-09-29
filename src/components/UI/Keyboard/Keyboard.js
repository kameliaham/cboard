import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Keyboard from '@material-ui/icons/Keyboard';

import IconButton from '../../UI/IconButton';
import messages from '../../Settings/Settings.messages';

const propTypes = {
  /**
   * The component used for the root node. Either a string to use a DOM element or a component.
   */
  component: PropTypes.object,
  /**
   * If true, back button is disabled
   */
  disabled: PropTypes.bool,
  /**
   * @ignore
   */
  intl: intlShape.isRequired,
  /**
   * Callback fired when back button is clicked
   */
  onClick: PropTypes.func
};

function KeyboardButton(props) {
  const { intl, ...other } = props;
  const label = intl.formatMessage(messages.keyboard);

  return (
    <IconButton id="keyboard" label={label} {...other}>
      <Keyboard />
    </IconButton>
  );
}

KeyboardButton.propTypes = propTypes;

export default injectIntl(KeyboardButton);
