# BARAQA_BIN Frontend

Smart Waste Management System - React Frontend with TypeScript and Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
# .env file is already set up
VITE_API_BASE_URL=http://localhost:5000
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔌 Backend Connection

The frontend connects to the Flask backend via the API service layer:

**API Service:** `src/services/api.ts`
- Handles all HTTP requests to Flask backend
- Automatic error handling and response parsing
- TypeScript types for all endpoints

**Endpoints Used:**
- `POST /api/login` - User authentication
- `GET /api/user/:id/stats` - User statistics
- `GET /api/user/:id/history` - Waste disposal history
- `GET /api/leaderboard` - Top users ranking
- `GET /api/admin/bins` - Smart bins status
- `POST /api/admin/reset-bin` - Reset bin levels

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BinCard.tsx     # Smart bin display card
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── StatCard.tsx    # Statistics card
├── context/            # React Context providers
│   └── DataContext.tsx # Global data state with API integration
├── layouts/            # Page layouts
│   └── DashboardLayout.tsx
├── pages/              # Route pages
│   ├── AdminDashboard.tsx
│   ├── BinStatus.tsx
│   ├── History.tsx
│   ├── Leaderboard.tsx
│   ├── Login.tsx
│   └── StudentDashboard.tsx
├── services/           # API and data services
│   ├── api.ts         # Backend API integration
│   └── mockData.ts    # Fallback mock data
├── types/             # TypeScript type definitions
│   └── index.ts
├── App.tsx            # Main app with routing
└── main.tsx           # App entry point
```

## 🎨 Features

✅ **Real-time Data Sync** - Auto-fetches from backend on load
✅ **Authentication** - Login with username/password
✅ **Live Dashboard** - Points, recycling stats, carbon savings
✅ **Leaderboard** - Real-time rankings from database
✅ **Bin Monitoring** - Live fill levels and battery status
✅ **History Tracking** - Complete disposal logs
✅ **Responsive Design** - Mobile-friendly UI
✅ **Error Handling** - Graceful fallbacks and error messages
✅ **Loading States** - Visual feedback during API calls

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000
```

## 🎯 Default Login Credentials

```
Username: admin
Password: admin123
```

(Or any user from your MySQL database)

## 🎨 Tech Stack

- **Framework:** React 19 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router DOM v7
- **State:** React Context API
- **API:** Fetch API with TypeScript

## 📡 API Integration Details

The app fetches data from the backend on:
- Initial load (DataContext mount)
- User login
- Manual refresh (refresh button)

All API calls are centralized in `src/services/api.ts` with:
- Type-safe request/response handling
- Automatic JSON parsing
- Error handling with custom ApiError class
- Configurable base URL via environment variable

## 🔄 Data Flow

```
User Action → Component → API Service → Flask Backend → MySQL
                                            ↓
Component ← DataContext ← API Response ← Backend Response
```

## 🛠️ Troubleshooting

**CORS Issues?**
- Ensure Flask backend has `flask-cors` enabled
- Check backend is running on port 5000
- Verify `.env` has correct API URL

**Data Not Loading?**
- Check browser console for errors
- Verify backend is running (`python app.py`)
- Check database connection in backend
- Look for error messages in UI (red banners)

**Build Errors?**
- Run `npm install` to ensure all deps are installed
- Check for TypeScript errors with `npm run build`
