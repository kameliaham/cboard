import React, { useState, useEffect } from "react";
import "./TypingPage.css";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import BackspaceIcon from "@material-ui/icons/Backspace";
import SpaceBarIcon from "@material-ui/icons/SpaceBar";
import LanguageIcon from "@material-ui/icons/Language";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Navbar from '../Board/Navbar/Navbar';
import  tts  from '../../providers/SpeechProvider/tts';
import { getStore } from '../../store';
import { injectIntl } from 'react-intl';
import messages from './TypingPage.messages';


const TypingPage = ({ intl }) => {
  const alphabetString = intl.formatMessage(messages.alphabet);
  const textDirection = intl.formatMessage(messages.textDirection);
  const alphabetRows = alphabetString.split('%').map(row => row.trim().split(' '));
  //add a space key in a new row
  alphabetRows.push(["Space"]);

  const [text, setText] = useState(""); // Store the typed text

  const isSmallScreen = useMediaQuery("(max-width: 970px)");
  const store = getStore(); // Access the store
  const state = store.getState(); // Get the current state

  // Get the TTS options from the state that was set in the settings page
  const ttsOptions = state.speech.options;

  useEffect(() => {
    const initVoices = async () => {
      try {
        await tts.getVoices();
      } catch (err) {
        console.error("Error initializing voices:", err);
      }
    };
    initVoices();
  }, []);

  const handleClick = () => {
    const ttsParameters = {
      voiceURI: ttsOptions.voiceURI || '',
      pitch: ttsOptions.pitch || 1,
      rate: ttsOptions.rate || 1,
      volume: ttsOptions.volume || 1,
      onend: () => {
        console.log("TTS has finished speaking");
      }
    };

    const setCloudSpeakAlertTimeout = () => {
      return setTimeout(() => {
        console.log("Cloud speak alert timeout");
      }, 5000); // Adjust timeout as needed
    };

    try {
      tts.speak(text, ttsParameters, setCloudSpeakAlertTimeout);
    } catch (error) {
      console.error('Error during TTS:', error);
    }
  };

  const cancelSpeech = () => {
    tts.cancel();
  };

  useEffect(() => {
    return () => {
      cancelSpeech(); // Cancel speech when unmounting
    };
  }, []);


  // Handle deleting a letter
  const handleDelete = () => {
    setText((prevText) => prevText.slice(0, -1)); // Remove last character
  };

// Modify the language switch handling
  const onKeyPress = (key) => {
    if (key === "Space") {
      setText((prevText) => prevText + " ");
    }
    else {
      setText((prevText) => prevText + key);
    }
  };


  // Keyboard component
  const Keyboard = () => {
    return (
      <div className="keyboard">
        {alphabetRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="keyboard-row"
            style={isSmallScreen ? { gap: "10px" } :
            { gap: `${20 + rowIndex * 5}px` }} // Incrementing gap for each row
          >
            {row.map((key) => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className="key-button"
                style={{ backgroundColor: key === "Space" ? "#9E859A" : null }}
              >
                {key === "Space" ? <SpaceBarIcon /> : key === "switchLanguage" ? <LanguageIcon /> : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Mobile Layout
  if (isSmallScreen) {
    return (
      <div className="main-container">
        <div className="text-container">
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} style={{ margin: "0px", padding: "0px", width: "100%" }}>
              <Grid item xs={12} className="display-text">
                <div dir={textDirection}>{text}</div>
              </Grid>
              <Grid item xs={6} style={iconStyles1} onClick={handleClick}>
                <IconButton className="mobile-button">
                  <VolumeUpIcon />
                </IconButton>
              </Grid>
              <Grid item xs={6} style={iconStyles2} onClick={handleDelete}>
                <IconButton className="mobile-button">
                  <BackspaceIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        </div>
        <div className="keyboard-container">
          <Keyboard />
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="main-container">
      <div className="text-container">
        <Box sx={{ flexGrow: 1 }}>
          <Grid container alignItems="center" spacing={2}>
            {/* Text Display */}
            <Grid item xs={10}>
              <div className="display-text" dir={textDirection}>
                {text}
              </div>
            </Grid>

            {/* Volume Icon */}
            <Grid item xs={1}>
              <div className="icon-container" onClick={handleClick}>
                <IconButton>
                  <VolumeUpIcon />
                </IconButton>
              </div>
            </Grid>

            {/* Backspace Icon */}
            <Grid item xs={1}>
              <div className="icon-container" onClick={handleDelete}>
                <IconButton>
                  <BackspaceIcon />
                </IconButton>
              </div>
            </Grid>
          </Grid>
        </Box>
      </div>
      <Navbar
        className="Board__navbar"
        disabled={false}
        isLocked={true}
        isScannerActive={false}
        onBackClick={() => {
          window.history.back();
        }
        }
        title='Typing Page'
      />

      <div className="keyboard-container">
        <Keyboard />
      </div>
    </div>
  );
};

// Styles
const iconStyles1 = {
  backgroundColor: "#262626",
  border: "1px solid white",
  borderRadius: "25px 0px 0px 25px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  padding: "5px",
  marginTop: "10px",
};

const iconStyles2 = {
  backgroundColor: "#262626",
  border: "1px solid white",
  borderRadius: "0px 25px 25px 0px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  padding: "5px",
  marginTop: "10px",
};

export default injectIntl(TypingPage);
