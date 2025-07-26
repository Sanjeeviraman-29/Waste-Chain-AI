# WasteChain AI - Session WCAI_0723

A comprehensive waste management platform with gamification, AI verification, and EPR compliance reporting.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Environment Setup

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Run the migration files in your Supabase SQL editor:
   - `supabase/migrations/create_core_schema.sql`
   - `supabase/migrations/setup_storage_policies.sql`

2. Deploy the Edge Functions:
   - `supabase/functions/on-pickup-created/`
   - `supabase/functions/process-completed-pickup/`
   - `supabase/functions/get-epr-dashboard-data/`

### Authentication Setup

In your Supabase dashboard:

1. **Authentication > Settings**:
   - Enable Email/Password provider
   - Enable Google OAuth provider
   - Set Site URL to your domain
   - Add redirect URLs for development/production

2. **Storage**:
   - The `waste-images` bucket will be created automatically
   - Policies are configured for secure user access

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Architecture

### Database Schema

- **profiles**: User profiles linked to auth.users
- **collectors**: Waste collector information
- **pickups**: Core waste pickup requests with status tracking
- **badges**: Gamification system for user achievements
- **user_badges**: User badge achievements
- **ledger_entries**: Immutable transaction ledger

### Edge Functions

1. **on-pickup-created**: Triggered when new pickup is created
   - Simulates AI verification
   - Awards initial points
   - Creates ledger entry

2. **process-completed-pickup**: Triggered when pickup is completed
   - Awards final points based on actual weight
   - Checks for new badge achievements
   - Updates user streaks

3. **get-epr-dashboard-data**: Invokable function for dashboard analytics
   - Aggregates EPR compliance data
   - Generates comprehensive reports
   - Returns formatted JSON for frontend

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Collectors can view assigned/pending pickups
- Secure image storage with folder-based access control

## 🎮 Features

### Gamification
- Green Points system
- Weekly streaks
- Achievement badges
- Community leaderboards

### AI Integration
- Waste verification scoring
- Automated point calculation
- Image analysis simulation

### EPR Compliance
- Comprehensive reporting
- Regulatory adherence tracking
- Environmental impact metrics
- PDF/CSV export capabilities

### Real-time Updates
- Database webhooks
- Automatic point calculations
- Badge notifications
- Streak tracking

## 🔧 Configuration

### Supabase Setup Checklist

- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Deploy Edge Functions
- [ ] Configure authentication providers
- [ ] Set up storage bucket
- [ ] Update environment variables
- [ ] Test database connections

### Authentication Providers

**Email/Password**: Enabled by default
**Google OAuth**: Configure in Supabase Auth settings

### Storage Configuration

**Bucket**: `waste-images` (private)
**File Size Limit**: 5MB
**Allowed Types**: JPEG, PNG, WebP
**Access Control**: User folder-based security

## 📊 Analytics & Reporting

The platform provides comprehensive analytics through the EPR dashboard:

- Waste collection metrics
- Environmental impact calculations
- Collector performance tracking
- User engagement statistics
- Compliance scoring
- Time-series data analysis

## 🔒 Security Features

- JWT-based authentication
- Row-level security policies
- Secure file uploads
- API rate limiting
- Input validation
- XSS protection

## 🌍 Internationalization

Supports multiple languages:
- English (default)
- Tamil (ta-IN)

Add new languages by creating translation files in `src/i18n/locales/`

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop dashboard layout
- Touch-friendly interactions
- Accessible design patterns

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### Edge Functions Deployment
Use Supabase CLI or dashboard to deploy functions from `supabase/functions/`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is part of the WasteChain AI initiative - Session WCAI_0723.