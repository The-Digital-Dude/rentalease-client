import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Create typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = (selector: (state: RootState) => any) => useSelector(selector); 