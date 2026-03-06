# Tripit 🌍✈️

Tripit is a full-stack travel companion web application that helps you plan trips, track expenses, discover local weather and food suggestions, translate text on-the-go, and stay connected with friends while travelling.

![Tripit Dashboard Preview](preview16.jpg)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [File Tree](#file-tree)
- [Module Explanations](#module-explanations)
  - [Backend](#backend-modules)
  - [Frontend](#frontend-modules)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup & Run](#setup--run)
- [API Overview](#api-overview)
- [Real-time Events (Socket.io)](#real-time-events-socketio)

---

## Features

- **Trip Management** – Create, view, and manage trips with AI-generated itineraries.
- **Dashboard Overview** – Live weather, local time, food suggestions, currency exchange rates, wallet/expense tracking, and a to-do list — all in one place.
- **AI Itinerary Generator** – Powered by Google Gemini to generate day-by-day itineraries.
- **Translation** – Translate text into 28+ languages via Lingva Translate (free, no API key required).
- **Social – Friends & Chat** – Add friends by unique Beyondly ID, send/receive friend requests, and chat in real-time.
- **Friends Map** – See where your friends are on an interactive Leaflet map.
- **Authentication** – Email/password sign-up & login, plus Google OAuth 2.0.
- **Dark / Light Theme** – User-controlled theme with persistent preference.

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, Tailwind CSS v4, React Router v7, Framer Motion, Leaflet, Socket.io-client |
| Backend   | Node.js, Express 5, MongoDB (Mongoose), Socket.io, Passport.js (Google OAuth) |
| Auth      | JWT (access + refresh tokens), bcrypt, HTTP-only cookies |
| AI        | Google Gemini (`@google/genai`) |
| APIs      | Open-Meteo (weather), Lingva Translate, Nominatim (reverse geocoding) |

---

## File Tree

```
Tripit/
├── preview16.jpg               # Dashboard UI preview image
├── README.md
│
├── backend/                    # Express + Socket.io API server
│   ├── package.json
│   └── src/
│       ├── server.js           # Entry point – Express app, MongoDB connection, Socket.io
│       ├── config/
│       │   └── auth.js         # JWT helpers & Google OAuth Passport strategy
│       ├── middleware/
│       │   └── auth.js         # requireAuth middleware (Bearer token guard)
│       ├── models/             # Mongoose schemas & models
│       │   ├── User.js         # User account (email, passwordHash, beyondlyId, …)
│       │   ├── Session.js      # Refresh-token sessions
│       │   ├── Trip.js         # Trip (destination, dates, itinerary, wallet, …)
│       │   ├── FriendRequest.js# Pending / accepted / rejected friend requests
│       │   ├── Friendship.js   # Accepted friendship between two users
│       │   ├── Message.js      # Chat messages within a friendship
│       │   └── UserLocation.js # User's current location (city, coordinates)
│       ├── routes/             # Express routers
│       │   ├── auth.js         # /auth – signup, login, logout, refresh, Google OAuth
│       │   ├── user.js         # /user – profile, Beyondly ID, avatar, location settings
│       │   ├── travel.js       # /travel – weather, food, FX rates, wallet, itinerary
│       │   ├── translate.js    # /translate – text translation via Lingva
│       │   ├── friends.js      # /friends – friend requests, friends list, remove friend
│       │   └── chat.js         # /chat – chat history, send message, mark as read
│       ├── socket/
│       │   └── index.js        # Socket.io event handlers (chat, location, friends)
│       └── utils/
│           └── geocoding.js    # Nominatim reverse / forward geocoding helper
│
└── frontend/                   # React + Vite SPA
    ├── index.html
    ├── package.json
    ├── vite.config.mts
    ├── tsconfig.json
    ├── public/
    │   ├── beyondly-logo.png
    │   ├── preview16.jpg
    │   └── vite.svg
    └── src/
        ├── main.tsx            # React DOM entry point
        ├── App.jsx             # Root component – routing & context providers
        ├── api/
        │   └── client.js       # Axios instance with auth interceptors
        ├── context/
        │   ├── AuthContext.jsx  # Authentication state & helpers (login, logout, …)
        │   ├── SocketContext.jsx# Socket.io connection management
        │   └── ThemeContext.jsx # Dark / light theme state
        ├── hooks/              # Custom React hooks
        │   ├── useTrips.js     # CRUD operations for trips
        │   ├── useWeather.js   # Fetch weather for a location
        │   ├── useFxRates.js   # Fetch currency exchange rates
        │   ├── useTranslate.js # Text translation
        │   ├── useProfile.js   # User profile management
        │   ├── useFriends.js   # Friends list, friend requests
        │   └── useChat.js      # Chat history & send message
        ├── pages/
        │   ├── LandingPage.jsx     # Public landing / marketing page
        │   ├── SignInPage.jsx       # Login form
        │   ├── SignUpPage.jsx       # Registration form
        │   └── dashboard/
        │       ├── DashboardLayout.jsx   # Sidebar + outlet wrapper
        │       ├── OverviewPage.jsx      # Main dashboard with all cards
        │       ├── NewTripPage.jsx        # Create a new trip
        │       ├── TripDetailPage.jsx     # View / manage a single trip
        │       ├── TripsHistoryPage.jsx   # List of all past & upcoming trips
        │       ├── TranslatePage.jsx      # Translation tool
        │       ├── SocialPage.jsx         # Friends, friend requests & chat
        │       └── SettingsPage.jsx       # Account & preference settings
        ├── components/
        │   ├── dashboard/          # Dashboard widget cards
        │   │   ├── WeatherCard.tsx
        │   │   ├── LocalTimeCard.tsx
        │   │   ├── LocationCard.tsx
        │   │   ├── FoodCard.tsx
        │   │   ├── ExchangeRatesCard.tsx
        │   │   ├── WalletCard.tsx
        │   │   ├── ExpenseCard.tsx
        │   │   ├── ItineraryCard.tsx
        │   │   ├── TodoCard.tsx
        │   │   └── index.ts
        │   ├── landing/            # Landing page widgets
        │   │   ├── WeatherWidget.tsx
        │   │   ├── FoodSuggestions.tsx
        │   │   └── PlacesSuggestions.tsx
        │   ├── social/             # Social / friends UI components
        │   │   ├── FriendsList.jsx
        │   │   ├── AddFriendModal.jsx
        │   │   ├── BeyondlyIdCard.jsx
        │   │   ├── ChatWindow.jsx
        │   │   ├── FriendsMap.jsx
        │   │   └── index.js
        │   └── ui/                 # Generic reusable UI primitives
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── input.tsx
        │       ├── badge.tsx
        │       └── utils.ts
        └── styles/
            └── global.css          # Global Tailwind / custom CSS
```

---

## Module Explanations

### Backend Modules

#### `src/server.js`
The application entry point. It:
- Bootstraps Express and attaches all middleware (CORS, JSON body parser, cookie-parser, Passport).
- Creates an `http.Server` and attaches Socket.io to it.
- Connects to MongoDB via Mongoose.
- Mounts all route handlers under their respective URL prefixes.
- Calls `setupSocketHandlers` to wire up real-time events.

#### `src/config/auth.js`
Handles all authentication primitives:
- `signAccessToken` / `signRefreshToken` – create short-lived (15 min) and long-lived (7 day) JWTs.
- `verifyAccessToken` / `verifyRefreshToken` – validate tokens.
- `configureGoogleStrategy` – registers the Passport Google OAuth 2.0 strategy, creating or linking user accounts automatically.

#### `src/middleware/auth.js`
`requireAuth` – a single Express middleware that reads the `Authorization: Bearer <token>` header, verifies the access token, and attaches `req.user` for downstream handlers.

#### `src/models/`

| Model | Purpose |
|-------|---------|
| `User` | Core user account. Stores email, hashed password, Google OAuth ID, preferred currency, language, online status, and a unique shareable **Beyondly ID** (e.g. `BYD-4X92K`). |
| `Session` | Tracks active refresh tokens so they can be revoked on logout or re-issue. |
| `Trip` | A travel record with destination, dates, AI-generated itinerary, wallet budget, expenses, and to-do items. |
| `FriendRequest` | A directed request with status `pending`, `accepted`, or `rejected`. |
| `Friendship` | A join document created when a friend request is accepted; both user IDs are stored in a `users` array. |
| `Message` | A single chat message tied to a `Friendship`, with read/unread tracking. |
| `UserLocation` | Stores the user's current city, country, and coordinates. Updated via Socket.io events. |

#### `src/routes/`

| Route file | Prefix | Key endpoints |
|------------|--------|---------------|
| `auth.js` | `/auth` | `POST /signup`, `POST /login`, `POST /logout`, `POST /refresh`, `GET /google`, `GET /google/callback`, `GET /me` |
| `user.js` | `/user` | `GET /me`, `GET /my-id`, `PATCH /avatar`, `PATCH /location-visibility`, `PUT /location`, `GET /location` |
| `travel.js` | `/travel` | `POST /weather`, `POST /food`, `POST /fx`, `POST /wallet`, `POST /itinerary`, trip CRUD endpoints |
| `translate.js` | `/translate` | `POST /` – translate text to a target language |
| `friends.js` | `/friends` | `POST /add`, `GET /requests`, `GET /requests/sent`, `PATCH /accept/:id`, `PATCH /reject/:id`, `GET /`, `DELETE /:id` |
| `chat.js` | `/chat` | `GET /:friendId`, `POST /:friendId`, `GET /unread/count`, `PATCH /:friendId/read` |

#### `src/socket/index.js`
Sets up all Socket.io event handlers after authenticating the socket connection via JWT. Key events:

- **Chat**: `chat:send`, `chat:sent`, `chat:receive`, `chat:read`, `chat:typing`
- **Location**: `location:update`, `location:request_friends`, `location:friends`, `location:friend_update`
- **Friends**: `friend:request_sent`, `friend:request_received`, `friend:accepted`, `friend:request_accepted`, `friend:status_change`

A `connectedUsers` Map (userId → socketId) tracks online users for targeted delivery.

#### `src/utils/geocoding.js`
Wraps the free Nominatim (OpenStreetMap) API to convert a city name to latitude/longitude coordinates. Used to display friends on the map when only a city name is known.

---

### Frontend Modules

#### `src/api/client.js`
A pre-configured Axios instance that:
- Attaches the JWT access token from `AuthContext` to every request.
- Intercepts 401 responses to attempt a silent token refresh, then retries the original request.

#### `src/context/`

| Context | Purpose |
|---------|---------|
| `AuthContext` | Stores the logged-in user and access token; exposes `login`, `logout`, `signup` helpers. Persists the token in memory and refreshes it on page load. |
| `SocketContext` | Creates and manages the Socket.io client connection. Reconnects automatically when the access token changes. Exposes the `socket` instance via `useContext`. |
| `ThemeContext` | Toggles between `light` and `dark` CSS classes on `<html>`. Persists the preference to `localStorage`. |

#### `src/hooks/`

| Hook | Purpose |
|------|---------|
| `useTrips` | Fetch trip list, create trip, update trip (itinerary, wallet, todos), delete trip. |
| `useWeather` | Fetch current weather from the backend (which calls Open-Meteo). |
| `useFxRates` | Fetch live exchange rates for a currency pair. |
| `useTranslate` | Send text to the `/translate` endpoint and return the translated result. |
| `useProfile` | Read and update the user's profile (avatar, location visibility, preferred currency). |
| `useFriends` | Load friends list, incoming/outgoing friend requests; send, accept, reject requests; remove a friend. |
| `useChat` | Load chat history with a specific friend; send messages; track unread counts. |

#### `src/pages/`

| Page | Route | Description |
|------|-------|-------------|
| `LandingPage` | `/` | Public marketing page with live weather, food, and places widgets. |
| `SignInPage` | `/auth/signin` | Email/password login form with a "Sign in with Google" button. |
| `SignUpPage` | `/auth/signup` | Registration form (name, email, password, preferred currency). |
| `DashboardLayout` | `/dashboard/*` | Sidebar navigation shell that wraps all protected dashboard pages. |
| `OverviewPage` | `/dashboard/overview` | Main view with all dashboard cards (weather, time, food, FX rates, wallet, itinerary, todos). |
| `NewTripPage` | `/dashboard/trip/new` | Form to create a new trip and optionally generate an AI itinerary. |
| `TripDetailPage` | `/dashboard/trip/:tripId` | Full view of a trip – itinerary, wallet, expenses, todos, and map. |
| `TripsHistoryPage` | `/dashboard/trips/history` | Chronological list of all trips. |
| `TranslatePage` | `/dashboard/tools/translate` | Real-time text translation with language selector. |
| `SocialPage` | `/dashboard/social` | Friends list, friend requests, Beyondly ID card, chat window, and friends map. |
| `SettingsPage` | `/dashboard/settings` | Account settings – name, avatar, preferred currency, location visibility, password change. |

#### `src/components/dashboard/`
Self-contained card components rendered on `OverviewPage` and `TripDetailPage`. Each card fetches its own data via the corresponding hook or receives props:

- **WeatherCard** – Current temperature, humidity, wind speed, and weather condition.
- **LocalTimeCard** – Current local time and time zone for the trip destination.
- **LocationCard** – User's current location with a mini-map.
- **FoodCard** – AI-suggested local restaurants and cuisine for the destination.
- **ExchangeRatesCard** – Live base→target currency conversion.
- **WalletCard** – Trip budget, currency, and remaining balance.
- **ExpenseCard** – Add and track individual expenses against the trip wallet.
- **ItineraryCard** – Day-by-day activities generated by Google Gemini.
- **TodoCard** – Simple checklist tied to the current trip.

#### `src/components/social/`

- **FriendsList** – Renders the list of accepted friends with online status indicators.
- **AddFriendModal** – Modal to search and send a friend request by Beyondly ID.
- **BeyondlyIdCard** – Displays the current user's shareable Beyondly ID.
- **ChatWindow** – Real-time chat UI backed by Socket.io events.
- **FriendsMap** – Interactive Leaflet map showing friends' current locations.

#### `src/components/ui/`
Reusable, unstyled-then-styled primitive components (`Button`, `Card`, `Input`, `Badge`) built with Tailwind CSS and `class-variance-authority` (CVA) for variant support.

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **MongoDB Atlas** cluster (or local MongoDB instance)
- *(Optional)* Google Cloud project with OAuth 2.0 credentials for Google Sign-In
- *(Optional)* Google Gemini API key for AI itinerary generation

---

## Environment Variables

### Backend (`backend/.env`)

```env
# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/tripit

# JWT secrets (use long random strings)
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Server
PORT=4000
NODE_ENV=development

# Frontend origin (for CORS)
CLIENT_ORIGIN=http://localhost:5173

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Google Gemini AI (optional – required for itinerary generation)
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000
```

---

## Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/Hari-Padmesh/Tripit.git
cd Tripit
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

Create a `.env` file inside the `backend/` directory using the variables listed in the [Environment Variables](#environment-variables) section above.

### 4. Start the Backend Server

```bash
# From the backend/ directory
npm start
```

The server will start on `http://localhost:4000` (or the `PORT` you set).

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 6. Configure Frontend Environment

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:4000
```

### 7. Start the Frontend Dev Server

```bash
# From the frontend/ directory
npm run dev
```

The app will be available at `http://localhost:5173`.

### 8. Build for Production (Frontend)

```bash
# From the frontend/ directory
npm run build
```

The compiled output is placed in `frontend/dist/` and can be served by any static file host or CDN.

---

## API Overview

All API routes are prefixed with the backend base URL (default `http://localhost:4000`).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | – | Register a new user |
| `POST` | `/auth/login` | – | Log in and receive tokens |
| `POST` | `/auth/logout` | – | Clear the refresh-token cookie |
| `POST` | `/auth/refresh` | cookie | Exchange refresh token for a new access token |
| `GET` | `/auth/google` | – | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | – | Google OAuth callback |
| `GET` | `/user/me` | Bearer | Get full profile |
| `PATCH` | `/user/avatar` | Bearer | Update avatar |
| `PATCH` | `/user/location-visibility` | Bearer | Toggle location sharing |
| `POST` | `/travel/weather` | Bearer | Get weather for lat/lon |
| `POST` | `/travel/food` | Bearer | Get food suggestions for a location |
| `POST` | `/travel/fx` | Bearer | Get exchange rate for a currency pair |
| `POST` | `/travel/wallet` | Bearer | Create or update trip wallet |
| `POST` | `/travel/itinerary` | Bearer | Generate AI itinerary |
| `POST` | `/translate` | Bearer | Translate text |
| `POST` | `/friends/add` | Bearer | Send a friend request by Beyondly ID |
| `GET` | `/friends/requests` | Bearer | List incoming friend requests |
| `PATCH` | `/friends/accept/:id` | Bearer | Accept a friend request |
| `PATCH` | `/friends/reject/:id` | Bearer | Reject a friend request |
| `GET` | `/friends` | Bearer | List all friends |
| `DELETE` | `/friends/:id` | Bearer | Remove a friend |
| `GET` | `/chat/:friendId` | Bearer | Get chat history with a friend |
| `POST` | `/chat/:friendId` | Bearer | Send a message to a friend |
| `GET` | `/chat/unread/count` | Bearer | Get total unread message count |
| `GET` | `/health` | – | Health check endpoint |

---

## Real-time Events (Socket.io)

The backend accepts connections on the same port as the REST API. The client must pass the access token in the handshake auth:

```js
const socket = io("http://localhost:4000", {
  auth: { token: accessToken },
});
```

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `chat:send` | `{ friendId, content }` | Send a chat message |
| `chat:read` | `{ friendId }` | Mark messages from a friend as read |
| `chat:typing` | `{ friendId, isTyping }` | Send typing indicator |
| `location:update` | `{ city, country, lat, lng }` | Update your location |
| `location:request_friends` | – | Request current locations of all friends |
| `friend:request_sent` | `{ toUserId }` | Notify a user of a new friend request |
| `friend:accepted` | `{ friendId }` | Notify a user that their request was accepted |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `chat:sent` | message object | Confirmation of sent message |
| `chat:receive` | message object | Incoming message from a friend |
| `chat:messages_read` | `{ by: userId }` | Your messages were read by the friend |
| `chat:typing` | `{ userId, isTyping }` | Friend typing indicator |
| `location:friends` | array of location objects | Response to `location:request_friends` |
| `location:friend_update` | location object | A friend's location changed |
| `friend:request` | friend request object | You received a new friend request |
| `friend:request_received` | `{ from }` | (duplicate event alias) Friend request received |
| `friend:request_accepted` | `{ by }` | Your friend request was accepted |
| `friend:status_change` | `{ userId, isOnline, user }` | A friend came online or went offline |
