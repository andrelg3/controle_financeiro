import { UserProfile, Income, Bill, Debt, WishlistItem } from '../types';
import { INITIAL_USERS, INITIAL_INCOMES, INITIAL_BILLS, INITIAL_DEBTS, INITIAL_WISHLIST } from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'finance_app_users_v1',
  ACTIVE_USER: 'finance_app_active_user_v1',
  INCOMES: 'finance_app_incomes_v1',
  BILLS: 'finance_app_bills_v1',
  DEBTS: 'finance_app_debts_v1',
  WISHLIST: 'finance_app_wishlist_v1',
  ACTIVE_MONTH: 'finance_app_active_month_v1',
  SPREADSHEET_ID: 'finance_app_spreadsheet_id_v1',
  LAST_SYNC: 'finance_app_last_sync_v1',
};

export const getStoredUsers = (): UserProfile[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse users', e);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
};

export const saveStoredUsers = (users: UserProfile[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getStoredActiveUserId = (users: UserProfile[]): string => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (data && users.some(u => u.id === data)) return data;
  } catch (e) {
    console.error('Failed to get active user', e);
  }
  return users[0]?.id || 'andre';
};

export const saveStoredActiveUserId = (userId: string) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, userId);
};

export const getStoredActiveMonth = (): string => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_MONTH);
    if (data && /^\d{4}-\d{2}$/.test(data)) return data;
  } catch (e) {
    console.error('Failed to get active month', e);
  }
  return '2026-08'; // Starts in August 2026 as requested
};

export const saveStoredActiveMonth = (monthYear: string) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_MONTH, monthYear);
};

export const getStoredIncomes = (): Income[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INCOMES);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse incomes', e);
  }
  localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(INITIAL_INCOMES));
  return INITIAL_INCOMES;
};

export const saveStoredIncomes = (incomes: Income[]) => {
  localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
};

export const getStoredBills = (): Bill[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BILLS);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse bills', e);
  }
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_BILLS));
  return INITIAL_BILLS;
};

export const saveStoredBills = (bills: Bill[]) => {
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
};

export const getStoredDebts = (): Debt[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DEBTS);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse debts', e);
  }
  localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(INITIAL_DEBTS));
  return INITIAL_DEBTS;
};

export const saveStoredDebts = (debts: Debt[]) => {
  localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
};

export const getStoredWishlist = (): WishlistItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse wishlist', e);
  }
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(INITIAL_WISHLIST));
  return INITIAL_WISHLIST;
};

export const saveStoredWishlist = (wishlist: WishlistItem[]) => {
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
};

export const getStoredSpreadsheetId = (): string => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SPREADSHEET_ID);
    if (data) return data;
  } catch (e) {
    console.error('Failed to get spreadsheet ID', e);
  }
  return '1vRLMrK3jGUtHF0Vn3yXEjXHGBsq_HxBZ-7WqWdiGJHU';
};

export const saveStoredSpreadsheetId = (id: string) => {
  localStorage.setItem(STORAGE_KEYS.SPREADSHEET_ID, id);
};

export const getStoredLastSync = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch {
    return null;
  }
};

export const saveStoredLastSync = (timestamp: string) => {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
};

export const resetAllDataToDefault = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, 'andre');
  localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(INITIAL_INCOMES));
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_BILLS));
  localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(INITIAL_DEBTS));
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(INITIAL_WISHLIST));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_MONTH, '2026-08');
};
