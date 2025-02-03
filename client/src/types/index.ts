export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  profilePictureUrl?: string;
  phone?: string;
}

export interface Company {
  id: string;
  name: string;
  location: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
  phone: string;
}
