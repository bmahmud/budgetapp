# Personal Budget App

A comprehensive personal budget tracking application built with React Native and Expo. Track your income and expenses, set financial goals, and gain insights through detailed reports and analytics.

## Features

### ✅ Core Features

- **Transaction Management**
  - Add, edit, and delete income and expense transactions
  - Support for recurring transactions (monthly)
  - Categorize transactions with custom categories
  - Add notes to transactions

- **Category Management**
  - Pre-configured default categories (Food, Rent, Utilities, Transport, etc.)
  - Create custom categories with icons and colors
  - Category-based spending summaries

- **Financial Goals**
  - Create financial goals with target amounts
  - Set optional deadlines
  - Track progress toward goals
  - Visual progress indicators

- **Reports & Analytics**
  - Time-based reports (Daily, Monthly, Yearly, All Time)
  - Interactive charts:
    - Pie charts for expense breakdown
    - Bar charts for income vs expenses
  - Summary metrics:
    - Total income
    - Total expenses
    - Net balance
  - Top category summaries

- **Data Security**
  - Local-only storage (SQLite)
  - No external data sharing
  - Secure data handling

- **Settings**
  - Reset all data with confirmation
  - Dark mode support
  - Clean, modern UI

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Database**: Expo SQLite
- **Charts**: Victory Native
- **Date Handling**: date-fns
- **Icons**: Expo Symbols (SF Symbols)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your mobile device (iOS/Android)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

3. **Run on your device**

   - Scan the QR code with Expo Go (iOS) or the Expo Go app (Android)
   - Or press `i` for iOS simulator / `a` for Android emulator

### Project Structure

```
rnbudgetapp/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── transactions.tsx
│   │   ├── reports.tsx
│   │   └── settings.tsx
│   ├── transactions/      # Transaction screens
│   │   ├── add.tsx
│   │   └── [id].tsx
│   └── goals/             # Goal screens
│       └── [id].tsx
├── components/            # Reusable components
│   ├── transaction-card.tsx
│   ├── transaction-form.tsx
│   ├── summary-card.tsx
│   └── goal-card.tsx
├── lib/                   # Utilities and database
│   ├── database.ts        # SQLite operations
│   └── default-categories.ts
├── store/                 # State management
│   └── budget-store.ts    # Zustand store
├── types/                 # TypeScript types
│   └── index.ts
└── constants/             # App constants
    └── theme.ts
```

## Usage

### Adding a Transaction

1. Tap the **+** button on the Home screen or navigate to Transactions
2. Select transaction type (Income/Expense)
3. Enter amount, date, category, and optional notes
4. Toggle recurring if needed
5. Save

### Creating a Goal

1. Navigate to Goals (from Home screen)
2. Tap the **+** button
3. Enter goal name, target amount, and optional deadline
4. Track progress by updating current amount

### Viewing Reports

1. Navigate to Reports tab
2. Select time period (Month/Year/All Time)
3. View charts and category summaries

### Resetting Data

1. Go to Settings
2. Tap "Reset All Data"
3. Confirm the action

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint

### Database Schema

The app uses SQLite with the following tables:

- **categories**: Transaction categories
- **transactions**: Income and expense records
- **goals**: Financial goals

All data is stored locally on the device.

## Future Enhancements

- Cloud sync & multi-device support
- Data export (CSV/PDF)
- Budget limits & alerts
- AI-powered spending insights
- Multi-currency support
- Biometric authentication

## License

Private project for personal use.

## Support

For issues or questions, please refer to the Expo documentation or create an issue in the repository.
