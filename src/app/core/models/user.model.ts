export interface User {
  login: string;
  loggedInAt?: string;
}

export const STORAGE_KEY = "auth_user";
