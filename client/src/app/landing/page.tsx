"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Moon, Sun } from 'lucide-react';

const LandingPage = () => {
  const [currentDay, setCurrentDay] = useState(3); // Thursday (0-indexed)
  const [darkMode, setDarkMode] = useState(false);
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Apply dark mode data attribute when component mounts and when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);
  
  // Check for user's preferred color scheme on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);
  
  // Sample data based on the images
  const activityData = [1, 2, 3, 4, 1, 2, 1];
  const teachers = [
    { name: 'Anna Stewart', avatar: '/api/placeholder/40/40' },
    { name: 'Volter Anderson', avatar: '/api/placeholder/40/40' },
    { name: 'Alice Miller', avatar: '/api/placeholder/40/40' },
    { name: 'Monica Peterson', avatar: '/api/placeholder/40/40' }
  ];
  
  const popularCourses = [
    { 
      title: 'German Grammar and Vocabulary', 
      category: 'Languages',
      icon: '/api/placeholder/40/40'
    },
    { 
      title: 'Logic and Problem Solving', 
      category: 'Maths',
      icon: '/api/placeholder/40/40'
    },
    { 
      title: 'Chemistry and the Environment', 
      category: 'Chemistry',
      icon: '/api/placeholder/40/40'
    }
  ];
  
  const upcomingLessons = [
    {
      time: '10:00',
      title: 'Maths in Simple Terms'
    },
    {
      time: '12:00',
      title: 'Chemistry Is Easy!'
    }
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="h-screen">
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
        {/* Top Navigation Bar */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-20">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">Knowledge Platform</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">Help</Button>
            <Button variant="ghost" size="sm">Contact</Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 h-full flex flex-col border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 flex items-center">
              <div className="w-8 h-8 mr-2 flex items-center justify-center">
                <span role="img" aria-label="graduation cap">🎓</span>
              </div>
              <h1 className="text-lg font-semibold">Knowledge</h1>
            </div>
            
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                    <span role="img" aria-label="home" className="mr-3">🏠</span>
                    <span>Home</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <span role="img" aria-label="books" className="mr-3">📚</span>
                    <span>All courses</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <span role="img" aria-label="star" className="mr-3">⭐</span>
                    <span>Popular courses</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <span role="img" aria-label="calendar" className="mr-3">📅</span>
                    <span>Schedule</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <span role="img" aria-label="pencil" className="mr-3">📝</span>
                    <span>My courses</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <span role="img" aria-label="chart" className="mr-3">📊</span>
                    <span>Statistics</span>
                  </a>
                </li>
              </ul>
            </nav>
            
            <div className="p-4 mt-auto border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-500 dark:text-gray-300">VA</span>
                </div>
                <div>
                  <p className="font-medium">Volter Anderson</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium plan</p>
                </div>
              </div>
              <button className="flex items-center text-gray-700 dark:text-gray-300">
                <span role="img" aria-label="logout" className="mr-2">🚪</span>
                <span>Log out</span>
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Home</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back!</p>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <span role="img" aria-label="money" className="mr-2">💰</span>
                    <div>
                      <p className="text-sm font-bold">$ 323</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">My Balance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span role="img" aria-label="book" className="mr-2">📚</span>
                    <div>
                      <p className="text-sm font-bold">5 lesson</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Deposit</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">🔍</span>
                    <Input className="pl-10 w-64 bg-gray-50 dark:bg-gray-700" placeholder="Search" />
                  </div>
                  
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <span role="img" aria-label="bell">🔔</span>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Activity Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">My activity</h3>
                  <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
                    See all <span className="ml-1">▶</span>
                  </Button>
                </div>
                
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="h-48 flex items-end justify-between mb-6">
                      {activityData.map((value, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className={`w-12 rounded-md ${index === currentDay ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`} 
                            style={{ height: `${value * 40}px` }}
                          ></div>
                          <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">{daysOfWeek[index]}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      {upcomingLessons.map((lesson, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <div className="py-1 px-3 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-100 text-sm">
                            {lesson.time}
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="font-medium">{lesson.title}</p>
                          </div>
                          {index === 1 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500">
                              <span role="img" aria-label="edit">✏️</span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Call to Action and Progress Sections */}
              <div className="mb-8 space-y-4">
                <Card className="bg-blue-500 text-white">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg">Test your English level!</h4>
                      <Button className="mt-2 bg-gray-900 text-white hover:bg-gray-800">Pass test</Button>
                    </div>
                    <div className="text-4xl">
                      <span role="img" aria-label="books">📚</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="dark:bg-gray-800">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">English for travelling</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Start date: 04/05/2024</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tutor: Volter Anderson</p>
                    </div>
                    <div className="w-20 h-20 relative flex items-center justify-center">
                      <div className="absolute inset-0">
                        <Progress className="h-full w-full rounded-full" value={64} />
                      </div>
                      <span className="font-bold">64%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Teachers Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Your teachers</h3>
                  <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
                    See all <span className="ml-1">▶</span>
                  </Button>
                </div>
                
                <div className="flex space-x-8">
                  {teachers.map((teacher, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full mb-2 relative">
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white">
                          <span>▶</span>
                        </div>
                      </div>
                      <p className="text-sm">{teacher.name}</p>
                    </div>
                  ))}
                  
                  <div className="flex flex-col items-center">
                    <Button variant="outline" className="w-16 h-16 rounded-full flex items-center justify-center dark:border-gray-600">
                      <span className="text-xl">+</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Popular Courses Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Popular courses</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full dark:border-gray-600">
                      &lt;
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full dark:border-gray-600">
                      &gt;
                    </Button>
                  </div>
                </div>
                
                <div className="flex space-x-6 overflow-x-auto pb-4">
                  {popularCourses.map((course, index) => (
                    <Card key={index} className="flex-shrink-0 w-64 dark:bg-gray-800">
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{course.category}</p>
                        <h4 className="font-medium">{course.title}</h4>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;