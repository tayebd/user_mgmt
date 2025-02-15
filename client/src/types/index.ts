export type Company = {
  id: string;
  name: string;
  location: string;
  website: string;
  iconUrl?: string;
  phone: string;
  logo: string;
  established: string;
  web_validity?: boolean;
  capabilities?: string;
  fb_handle?: string;
  residential?: boolean;
  commercial?: boolean;
  descriptions: Description[];
  badge: string;
  rating: number;
  reviews: number;
};

export type Description = {
  id: string;
  language: string;
  text: string;
};

export type Review = {
  id: string;
  userId: string;
  companyId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
};
