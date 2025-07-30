# Wheel of Spice 🌶️

A beautiful, interactive web application for discovering, learning about, and ranking your favorite spices. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Spice Discovery**: Browse through 25+ carefully curated spices with detailed information
- **Interactive Ranking**: Rate spices on a 1-10 scale with an intuitive slider interface
- **Spin the Wheel**: Can't decide? Let the spinning wheel choose a random spice for you
- **Smart Comparisons**: When spices have the same rating, the app helps you decide which you prefer
- **Drag & Drop Reordering**: Easily reorder your rankings by dragging spices up or down
- **User Authentication**: Sign up to save your rankings across devices
- **Anonymous Mode**: Start ranking immediately without creating an account
- **Community Ratings**: See how your taste compares to the community average
- **Responsive Design**: Beautiful interface that works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wheel-of-spice.git
cd wheel-of-spice
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
- Create a new Supabase project
- Run the SQL migrations in the `supabase/migrations/` folder
- Enable Row Level Security (RLS) on all tables

5. Start the development server:
```bash
npm run dev
```

## Database Schema

The application uses three main tables:

- `user_rankings`: Stores rankings for authenticated users
- `anonymous_rankings`: Stores rankings for anonymous sessions
- `community_ratings`: Aggregated community ratings updated via database triggers

## Features in Detail

### Spice Information
Each spice includes:
- Name and origin
- Detailed description
- Flavor profile tags
- Common culinary uses
- Visual color coding and icons

### Ranking System
- 1-10 scale with 0.1 precision
- Automatic sorting by rating
- Tie-breaking through direct comparisons
- Drag-and-drop reordering

### Authentication
- Email/password authentication via Supabase
- Anonymous mode with session-based storage
- Seamless transition from anonymous to authenticated

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Spice data curated from various culinary sources
- Icons provided by [Lucide](https://lucide.dev/)
- Built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)
- Database and authentication powered by [Supabase](https://supabase.com/)

## Live Demo

Check out the live application: [Wheel of Spice](https://cozy-cat-b583e4.netlify.app)