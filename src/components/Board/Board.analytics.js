import { isCordova, cvaTrackEvent } from '../../cordova-util';
import {
  IMPORT_BOARDS,
  CREATE_BOARD,
  CHANGE_BOARD,
  CREATE_TILE,
  DELETE_TILES,
  EDIT_TILES,
  CLICK_SYMBOL,
  CLICK_OUTPUT
} from './Board.constants';
import { getStore } from '../../store';

const getUserId = () => {
  return getStore().getState().app.userData.id;
};

// Utility function to get tiles labels
const getTiles = (boards, boardId, tilesId) => {
  const board = boards.find(board => board.id === boardId);
  if (!board) return '';

  return board.tiles
    .filter(tile => tilesId.includes(tile.id))
    .reduce((acc, tile) => (acc ? `${acc}, ${tile.label}` : tile.label), '');
};


const sendGtagEvent = (eventName, eventParams) => {
  window.gtag('event', eventName, eventParams);
  if (isCordova()) {
    cvaTrackEvent(eventParams.category, eventParams.action, eventParams.label, eventParams.event_s);
  }
};


const importBoards = (action, prevState, nextState) => {
  sendGtagEvent('import_boards', {
    category: 'Backup',
    action: 'Import Boards',
    event_s: getUserId()
  });
};

const changeBoard = (action, prevState, nextState) => {
  const board = nextState.board.boards.find(board => board.id === action.boardId);
  const boardName = board ? board.nameKey || board.name || board.id : 'root';

  sendGtagEvent('Change Board', {
    category: 'Navigation',
    action: 'Change Board',
    label: boardName,
    event_s: getUserId()
  });
};

const createBoard = (action, prevState, nextState) => {
  sendGtagEvent('Create Board', {
    category: 'Editing',
    action: 'Create Board',
    label: action.boardName,
    event_s: getUserId()
  });
};

const createTile = (action, prevState, nextState) => {
  sendGtagEvent('Create Tile', {
    category: 'Editing',
    action: 'Create Tile',
    label: action.tile.label,
    event_s: getUserId()
  });
};

const deleteTiles = (action, prevState, nextState) => {
  const deletedTiles = getTiles(prevState.board.boards, action.boardId, action.tiles);

  sendGtagEvent('Delete Tiles', {
    category: 'Editing',
    action: 'Delete Tiles',
    label: deletedTiles,
    event_s: getUserId()
  });
};

const editTiles = (action, prevState, nextState) => {
  const editedTiles = action.tiles.reduce((acc, tile) => (acc ? `${acc}, ${tile.label}` : tile.label), '');

  sendGtagEvent('Edit Tiles', {
    category: 'Editing',
    action: 'Edit Tiles',
    label: editedTiles,
    event_s: getUserId()
  });
};

const clickSymbol = (action, prevState, nextState) => {
  sendGtagEvent('Click Symbol', {
    category: 'Navigation',
    action: 'Click Symbol',
    label: action.symbolLabel,
    event_s: getUserId()
  });
};

const clickOutput = (action, prevState, nextState) => {
  sendGtagEvent('Click Output', {
    category: 'Speech',
    action: 'Click Output',
    label: action.outputPhrase,
    event_s: getUserId()
  });
};


const eventsMap = {
  [IMPORT_BOARDS]: importBoards,
  [CREATE_BOARD]: createBoard,
  [CHANGE_BOARD]: changeBoard,
  [CREATE_TILE]: createTile,
  [DELETE_TILES]: deleteTiles,
  [EDIT_TILES]: editTiles,
  [CLICK_SYMBOL]: clickSymbol,
  [CLICK_OUTPUT]: clickOutput
};

export default eventsMap;
