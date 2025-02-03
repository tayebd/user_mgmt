# Product Context

## Why This Project Exists
The project aims to create a comprehensive directory platform that connects users with companies based on their specific needs, location, and preferences. It serves as a bridge between businesses and potential customers, making it easier to discover and evaluate companies based on verified data and user experiences.

## What Problems It Solves
- **Discovery Challenge**: Simplifies finding relevant companies based on specific requirements and location
- **Verification Gap**: Provides verified company information and capabilities
- **Decision Making**: Helps users make informed decisions through authentic reviews and ratings
- **Geographic Relevance**: Ensures users find companies that operate in their area
- **Capability Matching**: Matches user requirements with company specializations and services

## How It Should Work
- **User Authentication**: Users can create accounts or log in using Firebase authentication. Users can still search for companies even if they are logged in.
- **Search Interface**: 
  - Location-based search using geolocation or manual input
  - Capability filtering based on company services and expertise
  - Review-based filtering to find highly-rated companies
- **Company Profiles**:
  - Detailed company information including services, location, and contact details
  - Verified capability badges and certifications
  - Customer reviews and ratings
- **Search Results**:
  - Displays companies matching search criteria
  - Sort options (distance, rating, relevance)
  - Interactive map view of company locations

## Technical Architecture

### Frontend
- **Framework**: React with Next.js for server-side rendering and routing
- **Styling**: Tailwind CSS with ShadCN components for consistent UI
- **State Management**: Zustand for simple and efficient state handling
- **Map Integration**: Integration with mapping services for location-based features

### Backend
- **Server**: Node.js with Express for RESTful API endpoints
- **Database Operations**: Prisma ORM for type-safe database queries
- **Data Storage**: PostgreSQL for reliable company and user data storage
- **Authentication**: Firebase for secure user authentication and management

### Data Model
- Companies (name, location, capabilities, contact info)
- Reviews (ratings, comments, user references)
- Users (profiles, preferences, saved searches), Firebase will manage Users
- Capabilities (categories, subcategories, skills)


