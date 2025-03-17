export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  role?: string;
}

export interface ApiState {
  users: User[];
  fetchUserByUid: (uid: string) => Promise<User>;
  findUserByEmail: (email: string) => Promise<User | null>;
}
