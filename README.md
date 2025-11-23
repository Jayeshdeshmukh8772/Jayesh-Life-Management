# Jayesh Life Management System

A comprehensive full-stack life management application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### 1. Home Dashboard
- Daily streak tracking
- Savings progress visualization
- OLQ improvement scores
- Learning progress metrics
- Total badges earned
- AI-generated daily motivation
- Quick links to all modules

### 2. Portfolio Module
- Personal profile with photo and bio
- Skills tracking (Technical, Soft Skills, Personal Traits)
- Certifications management
- Career timeline
- Resume preview and download
- Contact form

### 3. Cognizant Journey Module
- Daily journey logs
- People database with contacts, positions, LinkedIn profiles
- Achievements and milestones tracker
- First day experiences and notes

### 4. Learning & Work Tracker
- Task management with deadlines and completion tracking
- Daily learning logs with time tracking
- Multiple roadmaps:
  - Career roadmap
  - Defence mindset roadmap
  - Lifestyle roadmap
  - Riding roadmap
  - Finance roadmap
  - Travel roadmap
  - Self-Improvement roadmap
- Progress tracking and milestones

### 5. Personality Development System
- General traits tracking (9 traits):
  - Confidence, Discipline, Calmness
  - Emotional Control, Social Skills
  - Leadership, Decision Making
  - Riding Confidence, Fear Management

- 15 OLQs (Officer Like Qualities):
  - Effective Intelligence
  - Reasoning Ability
  - Organizing Ability
  - Power of Expression
  - Social Adaptability
  - Cooperation
  - Sense of Responsibility
  - Initiative
  - Self-Confidence
  - Speed of Decision
  - Ability to Influence Group
  - Liveliness
  - Determination
  - Courage
  - Stamina

- AI-generated suggestions and motivational content
- Progress charts and trend analysis

### 6. Diary & Memory System
- Daily diary entries with mood tracking
- Image attachments support
- Reflections:
  - What I learned today
  - What made me happy
  - What I must improve
- Weekly summaries
- PDF export functionality

### 7. Finance System
- Salary dashboard with breakdown:
  - Gross salary
  - Tax deductions
  - Other deductions
  - In-hand salary

- Savings & SIP tracking:
  - Monthly savings
  - Savings percentage
  - SIP amount
  - Future value projections
  - Emergency fund status

- Expense tracker with categories:
  - Food, Travel, Rent
  - Shopping, Entertainment
  - Utilities, Healthcare, Misc

- Expense insights and visualizations
- Financial goals with progress tracking (1yr, 3yr, 5yr)

### 8. Riding & Travel Module
- Weekend ride logs with:
  - Distance tracking
  - Route maps
  - Photos
  - Notes
  - Food reviews

- Chennai places explored database
- Bike maintenance logs
- Mileage tracker

### 9. Goals & Achievements
- Multi-category goal tracking:
  - Career
  - Fitness
  - Riding
  - Finance
  - Mental Health
  - Skill Development

- Badge system for achievements:
  - 7-day diary streak
  - 30 days of learning
  - Saved ₹10,000
  - 100 km ride
  - Completed roadmap milestones

- "Future Jayesh" letters
- Progress visualization

### 10. Settings Module
- Theme switcher (4 themes):
  - Glassmorphism
  - Neomorphism
  - Material 3
  - Dashboard Pro
- Data export (JSON backup)
- Data import
- Profile customization

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **PDF Export**: jsPDF & html2canvas

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── Card.tsx
│   ├── StatCard.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── pages/
│   ├── Home.tsx
│   ├── Portfolio.tsx
│   ├── Journey.tsx
│   ├── Learning.tsx
│   ├── Personality.tsx
│   ├── Diary.tsx
│   ├── Finance.tsx
│   ├── Riding.tsx
│   ├── Goals.tsx
│   └── Settings.tsx
├── context/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/
│   └── supabase.ts
├── App.tsx
└── main.tsx
```

## Database Schema

The application uses Supabase with 25+ tables including:
- User profiles and skills
- Journey logs and people database
- Tasks and learning logs
- Roadmaps and milestones
- Personality traits and OLQ scores
- Diary entries and summaries
- Financial data (salary, savings, expenses, goals)
- Riding logs and places explored
- Goals, badges, and streaks

All tables have Row Level Security (RLS) enabled for data protection.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. The database schema has been created via Supabase migrations

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   ```

## Design Features

- Responsive design for all screen sizes
- Smooth animations and transitions
- Glassmorphism effects
- Gradient text and cards
- Hover states and micro-interactions
- Clean visual hierarchy
- Modern color system with multiple themes
- Dark mode optimized

## Security

- Authentication via Supabase
- Row Level Security (RLS) on all tables
- Policies restrict data access to authenticated users
- No sensitive data in client code

## Future Enhancements

- Push notifications for goals and reminders
- Data analytics and insights
- Mobile app version
- Social sharing features
- AI-powered suggestions based on patterns
- Integration with fitness trackers
- Calendar view for all activities
