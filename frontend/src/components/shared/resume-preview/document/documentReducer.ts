export type DocumentState = {
  activeInstance: 'A' | 'B';
  aBlob?: Blob;
  bBlob?: Blob;
  pendingSwap: boolean;
};

export type DocumentAction =
  | { type: 'NEW_BLOB'; blob: Blob }
  | { type: 'TOGGLE_ACTIVE'; instance: 'A' | 'B' }
  | { type: 'RESET' };

export const initialState: DocumentState = {
  activeInstance: 'A',
  aBlob: undefined,
  bBlob: undefined,
  pendingSwap: false,
};

export function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'NEW_BLOB': {
      if (state.activeInstance === 'A') {
        return { ...state, bBlob: action.blob, pendingSwap: true };
      } else {
        return { ...state, aBlob: action.blob, pendingSwap: true };
      }
    }
    case 'TOGGLE_ACTIVE': {
      // Only swap if there's a pending swap and the ready instance is the inactive one
      if (state.pendingSwap && state.activeInstance !== action.instance) {
        return {
          ...state,
          activeInstance: action.instance,
          pendingSwap: false,
        };
      }
      return state;
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
