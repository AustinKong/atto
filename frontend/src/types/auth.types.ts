export const ACCESS_MODE_LIST = ['signed_out', 'guest', 'signed_in'] as const;

export type AccessMode = (typeof ACCESS_MODE_LIST)[number];
