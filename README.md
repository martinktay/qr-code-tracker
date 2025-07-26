# 🚀 SmartExporters - Logistics Tracking Platform

A comprehensive logistics tracking platform for "The Smart Exporters" built with React, Supabase, and modern web technologies. This platform enables efficient parcel management, real-time tracking, and seamless communication between all stakeholders in the logistics chain.

## ✨ Features

### 📦 Parcel Management

- **Box & Sack Registration**: Register and label boxes and sacks with unique tracking IDs
- **QR Code Generation**: Automatic QR/barcode generation for easy scanning and tracking
- **Status Tracking**: Real-time status updates with timestamps and GPS location
- **Professional Timeline**: Beautiful delivery timeline matching industry standards
- **PDF Label Generation**: Downloadable, printable labels with company branding

### 👥 User Management & Authentication

- **Role-Based Access Control**: Admin, Warehouse Staff, and Customer roles
- **Dual Authentication**: Supabase Auth with fallback to custom authentication
- **User Permissions**: Different features and data access based on roles
- **Session Management**: Secure login/logout with proper session handling

### 📱 Notifications & Communication

- **WhatsApp Integration**: Multilingual notifications (English, French, Yoruba, Spanish)
- **Email Alerts**: Status updates and delivery notifications
- **In-App Messaging**: Real-time chat between customers and support
- **File Sharing**: Upload and share images in conversations

### 🗺️ Tracking & Analytics

- **Map Integration**: Visual parcel tracking with Leaflet/Google Maps
- **Timeline View**: Detailed delivery progress with expandable stages
- **Customer Portal**: Self-service tracking with QR codes or phone numbers
- **Analytics Dashboard**: Real-time system statistics and performance metrics
- **International Shipping Analytics**: Specialized analytics for international shipments

### 🎨 Branding & Customization

- **Company Branding**: Upload logos and customize appearance
- **Legal Pages**: Terms of Service and Privacy Policy management
- **PDF Labels**: Generate printable labels with company branding
- **CSV Export**: Export data for external analysis
- **Modern UI/UX**: Beautiful, professional interface with improved aesthetics

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form management and validation
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - User-friendly notifications

### Backend

- **Supabase** - Backend-as-a-Service
  - PostgreSQL Database with advanced queries
  - Real-time subscriptions
  - Authentication with role management
  - File storage for images and documents
  - Row Level Security (RLS) policies

### External Services

- **Twilio** - WhatsApp messaging integration
- **Nodemailer** - Email notifications
- **Leaflet/Google Maps** - Map integration
- **JSPDF & HTML2Canvas** - PDF generation
- **jsQR** - QR code scanning and generation

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account
- Twilio account (for WhatsApp)
- SMTP service (for emails)

### 1. Clone the Repository

```bash
git clone https://github.com/martinktay/qr-code-tracker.git
cd qr-code-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio Configuration (for WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_whatsapp_number

# SMTP Configuration (for Email)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 4. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema in `supabase_schema.sql` or `complete_schema_fixed.sql`
3. Execute `setup_test_users.sql` for test data and user accounts
4. Apply RLS policies for security

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3001` (or the port shown in terminal) to see the application.

## 📊 Database Schema

### Core Tables

- **customers** - Customer information with contact details
- **boxes** - Box parcels with dimensions, weight, and content
- **sacks** - Sack parcels with weight and content details
- **scan_history** - Tracking updates with location, photos, and timestamps
- **user_accounts** - User roles and permissions management
- **company_settings** - Branding and notification settings
- **messages** - In-app messaging system

### Key Features

- **Enum Types**: `parcel_status`, `user_role`, `message_language`
- **Row Level Security**: Secure data access based on user roles
- **Real-time Subscriptions**: Live updates across the application
- **File Storage**: Photos and documents with secure access
- **Advanced Analytics**: Complex queries for business intelligence

## 🎯 User Roles & Access

### 👨‍💼 Admin

- **Dashboard**: System overview with real-time statistics
- **User Management**: Create and manage user accounts
- **Analytics**: View comprehensive system analytics and reports
- **Settings**: Configure company branding and notifications
- **International Shipping**: Specialized analytics for international operations

### 🏭 Warehouse Staff

- **Operations Dashboard**: Focused on daily operations
- **Parcel Registration**: Register new boxes and sacks
- **Scan & Log**: Update parcel status with location and photos
- **QR Code Generation**: Create and print tracking labels
- **Detailed Analytics**: Warehouse-specific performance metrics

### 👤 Customer

- **Customer Portal**: Self-service tracking interface
- **Parcel Tracking**: Track parcels via QR code or phone number
- **Timeline View**: Detailed delivery progress
- **Communication**: Chat with support team
- **Notifications**: Receive status updates via WhatsApp/Email

## 📱 Key Pages & Features

### Public Pages

- **Customer Portal** (`/portal`) - Self-service tracking
- **Terms of Service** (`/terms`) - Legal information
- **Privacy Policy** (`/privacy`) - Data protection

### Protected Pages

- **Dashboard** (`/dashboard`) - Role-based overview with real-time data
- **Register Box** (`/register-box`) - Create new boxes with QR codes
- **Register Sack** (`/register-sack`) - Create new sacks with QR codes
- **Scan & Log** (`/scan-and-log`) - Update parcel status with location
- **Map Tracker** (`/map-tracker`) - Visual tracking interface
- **Parcel Timeline** (`/parcel-timeline/:id`) - Detailed tracking history
- **Admin Panel** (`/admin-panel`) - System management
- **Debug Page** (`/debug`) - Development and troubleshooting

## 🔧 Configuration & Setup

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy project URL and anon key to environment variables
3. Run database schema from SQL files
4. Configure RLS policies for security
5. Set up storage buckets for file uploads

### Authentication Setup

- **Primary**: Supabase Auth for production use
- **Fallback**: Custom authentication for testing and development
- **Role Management**: Automatic role assignment from user_accounts table
- **Session Handling**: Secure login/logout with proper state management

### Twilio Setup (WhatsApp)

1. Create account at [twilio.com](https://twilio.com)
2. Get WhatsApp-enabled phone number
3. Copy Account SID and Auth Token
4. Configure webhook endpoints for notifications

### Deployment Options

- **Netlify**: Connect GitHub repository for automatic deployment
- **Vercel**: Import project and configure environment variables
- **Custom Server**: Build with `npm run build` and deploy static files

## 🐛 Recent Fixes & Improvements

### Authentication & User Management

- ✅ Fixed JSX syntax errors in Dashboard component
- ✅ Improved authentication flow with proper role setting
- ✅ Enhanced session management and logout functionality
- ✅ Added comprehensive debugging for troubleshooting

### UI/UX Enhancements

- ✅ Updated domain from smarttrack.com to smartexporters.com
- ✅ Improved application aesthetics with modern design
- ✅ Enhanced icon usage with Lucide React
- ✅ Added debug information panels for development

### Database & Backend

- ✅ Fixed SQL schema issues and constraints
- ✅ Improved error handling in authentication
- ✅ Enhanced real-time data fetching
- ✅ Added proper user role management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- 📧 Email: support@smartexporters.com
- 📱 WhatsApp: +1234567890
- 🐛 Issues: [GitHub Issues](https://github.com/martinktay/qr-code-tracker/issues)

## 🗺️ Roadmap

### Short Term

- [ ] Complete communication features between users
- [ ] Implement Help section with usage guides
- [ ] Add comprehensive Terms of Service and Privacy Policy
- [ ] Enhance mobile responsiveness

### Long Term

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API documentation
- [ ] Performance optimizations
- [ ] Automated testing suite
- [ ] CI/CD pipeline

## 🎉 Getting Started with Testing

### Test User Credentials

After running `setup_test_users.sql`, you can test with:

**Admin User:**

- Email: `admin@smartexporters.com`
- Password: `admin123`

**Warehouse Staff:**

- Email: `warehouse@smartexporters.com`
- Password: `warehouse123`

**Customer:**

- Email: `customer@smartexporters.com`
- Password: `customer123`

### Testing Features

1. **Authentication**: Test login/logout for all user roles
2. **Dashboard**: Verify role-specific dashboards render correctly
3. **QR Code**: Test QR code generation and scanning
4. **Parcel Registration**: Create new boxes and sacks
5. **Tracking**: Update parcel status and view timeline

---

**Built with ❤️ for The Smart Exporters**

_Last Updated: January 2025_
