# Australia 2026 - Shared Photo Album

A collaborative photo-sharing platform built with Next.js 15, TypeScript, Tailwind CSS, and Firebase for friends traveling to Australia in 2026.

## Features

- 🔐 **Google Authentication** - Secure sign-in with Google OAuth
- 📸 **Photo Gallery** - View and organize shared photos (Phase 2)
- 🗺️ **Interactive Map** - See where photos were taken (Phase 2)
- ⏱️ **Timeline View** - Chronological journey through your trip (Phase 2)
- 📱 **Responsive Design** - Works on mobile and desktop
- 🚀 **Modern Stack** - Built with the latest web technologies

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.14
- **Backend**: Firebase 12.4.0
  - Authentication (Google OAuth)
  - Firestore Database
  - Cloud Storage
- **State Management**: React Firebase Hooks 5.1.1
- **UI Library**: React 19.2.0

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Google account for Firebase setup

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd places
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions):
   - Create a Firebase project
   - Enable Google Authentication
   - Set up Firestore and Storage
   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase credentials to `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
/home/helye/DevProject/personal/Next-js/places/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Landing page
│   ├── globals.css        # Global styles
│   ├── gallery/           # Gallery view (Phase 2)
│   ├── map/               # Map view (Phase 2)
│   ├── timeline/          # Timeline view (Phase 2)
│   ├── upload/            # Upload page (Phase 2)
│   └── albums/new/        # New album page (Phase 2)
├── components/            # React components
│   └── AuthButton.tsx    # Authentication button
├── lib/                   # Utility libraries
│   └── firebase.ts       # Firebase configuration
├── docs/                  # Project documentation
├── .env.local.example    # Environment variables template
├── .gitignore            # Git ignore rules
└── package.json          # Dependencies and scripts
```

## Environment Variables

Required environment variables (add to `.env.local`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

See `.env.local.example` for a template.

## Firebase Setup

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete Firebase setup instructions including:
- Creating a Firebase project
- Enabling Google Authentication
- Setting up Firestore and Storage
- Configuring security rules

## Phase 1 Implementation Status

✅ **Completed:**
- [x] Next.js 15 project initialization with App Router
- [x] TypeScript configuration
- [x] Tailwind CSS v4 integration
- [x] Firebase SDK integration (v12.4.0)
- [x] Google OAuth authentication
- [x] Global layout with navigation
- [x] Responsive design
- [x] Landing page
- [x] Placeholder pages for all routes
- [x] Build and dev server working

⏳ **Pending (Phase 2):**
- [ ] Photo upload functionality
- [ ] Gallery view with albums
- [ ] Interactive map integration
- [ ] Timeline view
- [ ] Firestore data models
- [ ] Storage bucket organization
- [ ] Advanced authentication features

## Development

### Building for Production

```bash
npm run build
npm run start
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Contributing

This is a private project for friends traveling to Australia in 2026. If you're part of the group:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Known Issues

- Firebase authentication requires environment variables to be set
- Some placeholder pages return 404 until Phase 2 implementation

## Next Steps (Phase 2)

1. Implement photo upload with Firebase Storage
2. Create Firestore data models for albums and photos
3. Build gallery view with filtering
4. Integrate map library (Google Maps or Mapbox)
5. Implement timeline view with chronological sorting
6. Add photo metadata (location, date, tags)
7. Implement album creation and management

## License

Private project - All rights reserved

## Support

For setup issues or questions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) or contact the project maintainer.

---

Built with ❤️ for Australia 2026 🇦🇺
