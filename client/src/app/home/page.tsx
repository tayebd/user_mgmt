'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const HomePage = () => {
  const { user } = useAuth();
 
};

export default HomePage;
