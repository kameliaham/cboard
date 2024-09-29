import { isCordova, cvaTrackEvent } from '../../cordova-util';
import {
  CHANGE_VOICE,
  CHANGE_PITCH,
  CHANGE_RATE,
  START_SPEECH,
  EMPTY_VOICES
} from './SpeechProvider.constants';
import { getStore } from '../../store';

const getUserId = () => {
  return getStore().getState().app.userData.id;
};


const sendGtagEvent = (eventName, eventParams) => {
  window.gtag('event', eventName, eventParams);
  if (isCordova()) {
    cvaTrackEvent(eventParams.category, eventParams.action, eventParams.label);
  }
};


const changeVoice = (action, prevState, nextState) => {
  sendGtagEvent('Change Voice', {
    category: 'Speech',
    action: 'Change Voice',
    label: action ? action.voiceURI : EMPTY_VOICES,
    event_s: getUserId()
  });
};

const changePitch = (action, prevState, nextState) => {
  sendGtagEvent('Changed Pitch', {
    category: 'Speech',
    action: 'Changed Pitch',
    label: action.pitch,
    event_s: getUserId()
  });
};

const changeRate = (action, prevState, nextState) => {
  sendGtagEvent('Changed Rate', {
    category: 'Speech',
    action: 'Changed Rate',
    label: action.rate,
    event_s: getUserId()
  });
};

const startSpeech = (action, prevState, nextState) => {
  sendGtagEvent('Start Speech', {
    category: 'Speech',
    action: 'Start Speech',
    label: action.text,
    event_s: getUserId()
  });
};


const eventsMap = {
  [CHANGE_VOICE]: changeVoice,
  [CHANGE_PITCH]: changePitch,
  [CHANGE_RATE]: changeRate,
  [START_SPEECH]: startSpeech
};

export default eventsMap;
