export type DocumentState = {
  activeInstance: 'A' | 'B';
  aUrl?: string;
  bUrl?: string;
  pendingSwap: boolean;
};

export type DocumentAction =
  | { type: 'NEW_URL'; url: string }
  | { type: 'TOGGLE_ACTIVE'; instance: 'A' | 'B' }
  | { type: 'RESET' };

export const initialState: DocumentState = {
  activeInstance: 'A',
  aUrl: undefined,
  bUrl: undefined,
  pendingSwap: false,
};

export function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'NEW_URL': {
      if (state.activeInstance === 'A') {
        if (state.bUrl) URL.revokeObjectURL(state.bUrl);
        return { ...state, bUrl: action.url, pendingSwap: true };
      } else {
        if (state.aUrl) URL.revokeObjectURL(state.aUrl);
        return { ...state, aUrl: action.url, pendingSwap: true };
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
