import type { TemplateRenderGeometry } from '@/types/template.types';

export type DocumentState = {
  activeInstance: 'A' | 'B';
  aUrl?: string;
  aGeometry?: TemplateRenderGeometry;
  bUrl?: string;
  bGeometry?: TemplateRenderGeometry;
  pendingSwap: boolean;
};

export type DocumentAction =
  | { type: 'NEW_RENDER'; url: string; geometry: TemplateRenderGeometry }
  | { type: 'TOGGLE_ACTIVE'; instance: 'A' | 'B' };

export const initialState: DocumentState = {
  activeInstance: 'A',
  aUrl: undefined,
  aGeometry: undefined,
  bUrl: undefined,
  bGeometry: undefined,
  pendingSwap: false,
};

export function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'NEW_RENDER': {
      if (state.activeInstance === 'A') {
        if (state.bUrl) URL.revokeObjectURL(state.bUrl);
        return {
          ...state,
          bUrl: action.url,
          bGeometry: action.geometry,
          pendingSwap: true,
        };
      } else {
        if (state.aUrl) URL.revokeObjectURL(state.aUrl);
        return {
          ...state,
          aUrl: action.url,
          aGeometry: action.geometry,
          pendingSwap: true,
        };
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
    default:
      return state;
  }
}
