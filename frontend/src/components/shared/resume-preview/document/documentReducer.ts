export type DocumentState = {
  activeInstance: 'A' | 'B';
  aBlob?: Blob;
  bBlob?: Blob;
};

export type DocumentAction =
  | { type: 'NEW_BLOB'; blob: Blob }
  | { type: 'TOGGLE_ACTIVE' }
  | { type: 'RESET' };

export const initialState: DocumentState = {
  activeInstance: 'A',
  aBlob: undefined,
  bBlob: undefined,
};

export function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'NEW_BLOB': {
      if (state.activeInstance === 'A') {
        return { ...state, bBlob: action.blob };
      } else {
        return { ...state, aBlob: action.blob };
      }
    }
    case 'TOGGLE_ACTIVE':
      return { ...state, activeInstance: state.activeInstance === 'A' ? 'B' : 'A' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
