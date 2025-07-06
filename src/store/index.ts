// Export store and types
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Export user slice actions and types
export { login, logout, updateUser } from './userSlice';
export type { UserType, UserState } from './userSlice'; 