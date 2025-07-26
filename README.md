# 🚀 SmartTrack - Logistics Tracking Platform

A comprehensive logistics tracking platform for "The Smart Exporters" built with React, Supabase, and modern web technologies.

## ✨ Features

### 📦 Parcel Management
- **Box & Sack Registration**: Register and label boxes and sacks with unique tracking IDs
- **QR Code Generation**: Automatic QR/barcode generation for easy scanning
- **Status Tracking**: Real-time status updates with timestamps and GPS location
- **Professional Timeline**: Beautiful delivery timeline matching industry standards

### 👥 User Management
- **Role-Based Access**: Admin, Warehouse Staff, and Customer roles
- **Admin Panel**: Create and manage user accounts via email/phone
- **User Permissions**: Different features and data access based on roles

### 📱 Notifications & Communication
- **WhatsApp Integration**: Multilingual notifications (English, French, Yoruba, Spanish)
- **Email Alerts**: Status updates and delivery notifications
- **In-App Messaging**: Real-time chat between customers and support
- **File Sharing**: Upload and share images in conversations

### 🗺️ Tracking & Analytics
- **Map Integration**: Visual parcel tracking with Leaflet/Google Maps
- **Timeline View**: Detailed delivery progress with expandable stages
- **Customer Portal**: Self-service tracking with QR codes or phone numbers
- **Analytics Dashboard**: System statistics and performance metrics

### 🎨 Branding & Customization
- **Company Branding**: Upload logos and customize appearance
- **Legal Pages**: Terms of Service and Privacy Policy management
- **PDF Labels**: Generate printable labels with company branding
- **CSV Export**: Export data for external analysis

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TailwindCSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form management
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL Database
  - Real-time subscriptions
  - Authentication
  - File storage
  - Row Level Security (RLS)

### External Services
- **Twilio** - WhatsApp messaging
- **Nodemailer** - Email notifications
- **Leaflet/Google Maps** - Map integration
- **JSPDF & HTML2Canvas** - PDF generation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account
- Twilio account (for WhatsApp)
- SMTP service (for emails)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smarttrack-logistics.git
cd smarttrack-logistics
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
1. Create a new Supabase project
2. Run the SQL schema in `corrected_schema.sql`
3. Execute `seed_data_500_samples.sql` for test data
4. Apply RLS policies from `fix_rls_policies.sql`

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📊 Database Schema

### Core Tables
- **customers** - Customer information
- **boxes** - Box parcels with dimensions and content
- **sacks** - Sack parcels with weight and content
- **scan_history** - Tracking updates with location and photos
- **user_accounts** - User roles and permissions
- **company_settings** - Branding and notification settings
- **messages** - In-app messaging system

### Key Features
- **Enum Types**: `parcel_status`, `message_language`
- **Row Level Security**: Secure data access
- **Real-time Subscriptions**: Live updates
- **File Storage**: Photos and documents

## 🎯 User Roles

### 👨‍💼 Admin
- Manage company settings and branding
- Create and manage user accounts
- View system analytics and reports
- Configure notifications and messaging

### 🏭 Warehouse Staff
- Register new boxes and sacks
- Scan and update parcel status
- Upload photos and location data
- Generate QR codes and labels

### 👤 Customer
- Track parcels via QR code or phone
- View detailed delivery timeline
- Chat with support team
- Receive notifications

## 📱 Key Pages

### Public Pages
- **Customer Portal** (`/portal`) - Self-service tracking
- **Terms of Service** (`/terms`) - Legal information
- **Privacy Policy** (`/privacy`) - Data protection

### Protected Pages
- **Dashboard** (`/dashboard`) - Role-based overview
- **Register Box** (`/register-box`) - Create new boxes
- **Register Sack** (`/register-sack`) - Create new sacks
- **Scan & Log** (`/scan-and-log`) - Update parcel status
- **Map Tracker** (`/map-tracker`) - Visual tracking
- **Parcel Timeline** (`/parcel-timeline/:id`) - Detailed tracking
- **Admin Panel** (`/admin-panel`) - System management

## 🔧 Configuration

### Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Copy project URL and anon key
3. Run database schema
4. Configure RLS policies
5. Set up storage buckets

### Twilio Setup
1. Create account at [twilio.com](https://twilio.com)
2. Get WhatsApp-enabled phone number
3. Copy Account SID and Auth Token
4. Configure webhook endpoints

### Deployment
- **Netlify**: Connect GitHub repository
- **Vercel**: Import project and configure
- **Custom**: Build with `npm run build`

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
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/smarttrack-logistics/issues)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API documentation
- [ ] Performance optimizations
- [ ] Automated testing
- [ ] CI/CD pipeline

---

**Built with ❤️ for The Smart Exporters**
