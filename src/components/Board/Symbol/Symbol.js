import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isCordova } from '../../../cordova-util';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import messages from '../Board.messages';
import { LABEL_POSITION_BELOW } from '../../Settings/Display/Display.constants';
import './Symbol.css';
import { Typography } from '@material-ui/core';
import { getArasaacDB } from '../../../idb/arasaac/arasaacdb';
import EditIcon from '@material-ui/icons/Edit';

const propTypes = {
  image: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  labelpos: PropTypes.string,
  type: PropTypes.string,
  onWrite: PropTypes.func,
  intl: PropTypes.object,
};

function Symbol(props) {
  const { className, label, labelpos, keyPath, type, onWrite, intl, image, ...other } = props;
  const [src, setSrc] = useState('');
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [width, setWidth] = useState(); 
  const [height, setHeight] = useState(); 
  const [showImage, setShowImage] = useState(true); 
  useEffect(() => {
    async function getSrc() {
      let image = null;
      if (keyPath) {
        const arasaacDB = await getArasaacDB();
        image = await arasaacDB.getImageById(keyPath);
      }

      if (image) {
        const blob = new Blob([image.data], { type: image.type });
        setSrc(URL.createObjectURL(blob));
      } else if (props.image) {
        const image = isCordova() && props.image && props.image.search('/') === 0
          ? `.${props.image}`
          : props.image;

        setSrc(image);
      }
    }

    getSrc();
  }, [keyPath, props.image]);

  const handleMouseEnter = () => {
    setShowEditIcon(true);
  };

  const handleMouseLeave = () => {
    setShowEditIcon(false);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    setIsEditing(true);
    setShowImage(false); 
  };
 
  useEffect(() => {
    const savedWidth = localStorage.getItem('imageWidth');
    const savedHeight = localStorage.getItem('imageHeight');

    if (savedWidth) {
        setWidth(Number(savedWidth)); // Set width from local storage
    }
    if (savedHeight) {
        setHeight(Number(savedHeight)); // Set height from local storage
    }
}, []);

  const handleSaveChanges = (event) => {
    event.stopPropagation();
    console.log(`New dimensions: ${width}x${height}`);
    localStorage.setItem('imageWidth', width);
    localStorage.setItem('imageHeight', height);
    setIsEditing(false);
    setShowImage(true); 
  };
  const handleReturn = (event) => {
    setIsEditing(false);
    setShowImage(true);
    event.stopPropagation();
  }
  const handleWidthChange = (e) => { 
    setWidth(e.target.value);
  };

  const handleHeightChange = (e) => {
    setHeight(e.target.value);
  };

  const handleInputClick = (event) => {
    event.stopPropagation();
  };

  const symbolClassName = classNames('Symbol', className);

  return (
    <div
      className={symbolClassName}
      image={src}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...other}
    >
      {type === 'live' && (
        <OutlinedInput
          id="outlined-live-input"
          margin="none"
          color="primary"
          variant="filled"
          placeholder={intl.formatMessage(messages.writeAndSay)}
          autoFocus
          multiline
          rows={5}
          value={label}
          onChange={onWrite}
          fullWidth
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
            }
          }}
          style={{ padding: '0.5em 0.8em', height: '100%' }}
          className={'liveInput'}
        />
      )}
      {isEditing && type !== 'live' && labelpos === 'Above' && labelpos !== 'Hidden' && (
        <Typography className="Symbol__label">{label}</Typography>
      )}
      {showImage && src && ( 
        <div className="Symbol__image-container">
          <img  
            src={src} 
            alt="" 
            style={{ width: `${width}px`, height: `${height}px`,maxHeight:'100%',position:'relative', maxWidth:'100%', objectFit: 'contain'}} // Apply dimensions
          />
          {showEditIcon && (
            <EditIcon className="edit-icon" onClick={handleEditClick} />
          )}
        </div>
      )}
      {isEditing && (
        <div className='edit-form' onClick={handleReturn}> 
          <label>
          <strong>Width:</strong>
          <input  
                type="number" 
                value={width} 
                onClick={handleInputClick} 
                onChange={handleWidthChange} 
               style={{
                      marginLeft: '10%', padding: '5px', border: '1px solid #ccc', borderRadius: '5px', width: '50%',height: '90%',
                      fontSize: '80%',
                     }} 
            />
          </label>
          <br/>
          <label>
            <strong>Height:</strong>
            <input 
              type="number" 
              value={height} 
              onChange={handleHeightChange} 
              onClick={handleInputClick} 
              style={{
                marginLeft: '8%', padding: '5px', border: '1px solid #ccc', borderRadius: '5px', width: '50%', height: '90%',
                fontSize: '80%',}} 
            />
          </label>
          <br />
          <div style={{ textAlign: 'center',}}>
          <button onClick={handleSaveChanges} style={{backgroundColor: '#007BFF', color: '#FFFFFF',border: 'none',
          borderRadius: '5px',padding: '5px 5px',fontSize: '12px',cursor: 'pointer',outline: 'none',
                       }}
          >
            Save
          </button>
          </div>
        </div>
      )}
     {!isEditing && type !== 'live' && labelpos === 'Below' && labelpos !== 'Hidden' && (
        <Typography className="Symbol__label">{label}</Typography>
      )}
    
    </div>
  );
}

Symbol.propTypes = propTypes;
Symbol.defaultProps = {
  labelpos: LABEL_POSITION_BELOW,
};

export default Symbol;
