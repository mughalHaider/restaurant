# 🍽️ Madot Restaurant Reservation System

A comprehensive, modern restaurant reservation management system built with Next.js 15, TypeScript, and Supabase. This full-stack application provides both customer-facing reservation booking and a complete admin dashboard for restaurant staff management.

## 🌟 Features

### Customer Features
- **Beautiful Landing Page** - Modern, responsive design with smooth animations
- **Online Reservation Booking** - Easy-to-use reservation form with date/time selection
- **Real-time Availability** - Dynamic time slots based on restaurant hours
- **Holiday Management** - Automatic blocking of closed dates
- **Email Confirmations** - Professional HTML email notifications
- **Multi-language Support** - German language support included
- **Mobile Responsive** - Optimized for all device sizes

### Admin Dashboard Features
- **Role-based Access Control** - Admin, Manager, and Waiter roles
- **Reservation Management** - View, confirm, cancel, and edit reservations
- **Table Management** - Add, edit, and manage restaurant tables
- **Employee Management** - Add staff members with role assignments
- **Settings Management** - Configure opening hours and holidays
- **Real-time Statistics** - Dashboard with key metrics and analytics
- **Email Notifications** - Automated confirmation and rejection emails

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and authorization
- **Real-time subscriptions** - Live data updates

### Email & Notifications
- **Nodemailer** - Primary email sending functionality with Gmail SMTP
- **HTML Email Templates** - Professional styled email notifications
- **Automated Email System** - Confirmation and rejection emails

### UI Components
- **Radix UI** - Accessible component primitives
- **Custom Components** - Tailored UI components for the restaurant

## 📁 Project Structure

```
restaurant-reservation/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── reservations/       # Reservation CRUD operations
│   │   │   ├── send-confirmation-email/  # Email confirmation
│   │   │   └── send-rejection-email/     # Email rejection
│   │   ├── auth/                   # Authentication pages
│   │   ├── dashboard/              # Admin dashboard
│   │   │   ├── employees/          # Employee management
│   │   │   ├── reservations/       # Reservation management
│   │   │   ├── settings/           # Restaurant settings
│   │   │   ├── tables/             # Table management
│   │   │   └── stats/              # Analytics dashboard
│   │   ├── reservation/            # Customer booking page
│   │   ├── page.tsx               # Landing page
│   │   └── layout.tsx             # Root layout
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   ├── AlertModal.jsx         # Alert notifications
│   │   ├── ConfirmModal.jsx       # Confirmation dialogs
│   │   └── Footer.tsx             # Site footer
│   ├── lib/
│   │   ├── supabaseClient.ts      # Supabase configuration
│   │   ├── utils.ts               # Utility functions
│   │   └── withRole.tsx           # Role-based access control
│   └── app/message/
│       └── de.json                # German translations
├── public/                        # Static assets
├── package.json                   # Dependencies
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account
- Email service (Gmail or Resend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-reservation
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   NEXT_PUBLIC_SITE_URL=public_site_url_here
   ```
   
   **Note:** For Gmail with Nodemailer, you'll need to:
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password (not your regular password)
   - Use the App Password as `EMAIL_PASS`

4. **Set up Supabase Database**
   Create the following tables in your Supabase database:

   ```sql
   -- Reservations table
   CREATE TABLE reservations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     first_name TEXT NOT NULL,
     last_name TEXT NOT NULL,
     email TEXT NOT NULL,
     telephone TEXT NOT NULL,
     date DATE NOT NULL,
     time TEXT NOT NULL,
     guests INT NOT NULL,
     remark TEXT,
     status TEXT DEFAULT 'pending'
   );

   -- Employees table
   CREATE TABLE employees (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     role TEXT CHECK (role IN ('waiter', 'manager', 'admin')) NOT NULL
   );

   -- Restaurant tables
   CREATE TABLE restaurant_tables (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     number INT UNIQUE NOT NULL,
     capacity INT NOT NULL,
     status TEXT DEFAULT 'free'
   );

   -- Restaurant settings (additional table for configuration)
   CREATE TABLE restaurant_settings (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     opening_time TIME NOT NULL DEFAULT '10:00',
     closing_time TIME NOT NULL DEFAULT '22:00',
     closed_dates TEXT[],
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 User Roles & Permissions

### Admin
- Full access to all features
- Employee management
- Restaurant settings
- Table management
- Reservation management
- Analytics and reporting

### Manager
- Reservation management
- Table management
- Cannot manage employees or settings

### Waiter
- View reservations
- Mark guests as arrived
- Check Table status

## 📱 Pages & Features

### Customer Pages
- **Landing Page** (`/`) - Beautiful homepage with restaurant information
- **Reservation Page** (`/reservation`) - Online booking form

### Admin Dashboard Pages
- **Dashboard** (`/dashboard`) - Overview with statistics and today's reservations
- **Reservations** (`/dashboard/reservations`) - Complete reservation management
- **Tables** (`/dashboard/tables`) - Table configuration and status management
- **Employees** (`/dashboard/employees`) - Staff management and role assignment
- **Settings** (`/dashboard/settings`) - Restaurant hours and holiday configuration

## 🔧 Configuration

### Restaurant Settings
- **Opening Hours** - Set daily operating hours
- **Holiday Management** - Block specific dates
- **Time Slots** - Automatic 30-minute interval generation
- **Table Capacity** - Configure seating arrangements

### Email Configuration
- **Nodemailer with Gmail SMTP** - Primary email delivery system
- **Gmail App Passwords** - Secure authentication for email sending
- **HTML Email Templates** - Professional styled email designs
- **Automated Notifications** - Confirmation and rejection emails

## 🎨 Design Features

### UI/UX
- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Mobile-first approach
- **Smooth Animations** - Framer Motion integration
- **Color Scheme** - Amber/orange theme for warmth
- **Typography** - Professional font choices
- **Accessibility** - WCAG compliant components

### User Experience
- **Intuitive Navigation** - Easy-to-use interface
- **Real-time Updates** - Live data synchronization
- **Form Validation** - Client and server-side validation
- **Error Handling** - User-friendly error messages
- **Loading States** - Smooth loading indicators

## 📊 Database Schema

### Reservations
- Customer information (name, email, phone)
- Reservation details (date, time, guests)
- Status tracking (pending, accepted, arrived, cancelled)
- Table assignment
- Special requests/remarks

### Tables
- Table number and capacity
- Status tracking (available, reserved, occupied)
- Real-time updates

### Employees
- Staff information and roles
- Authentication integration
- Status management

### Settings
- Restaurant operating hours
- Holiday/closed dates
- Configuration management

## 🔐 Security Features

- **Role-based Access Control** - Granular permissions
- **Authentication** - Supabase Auth integration
- **Data Validation** - Zod schema validation
- **SQL Injection Protection** - Supabase ORM
- **CSRF Protection** - Next.js built-in security

## 📧 Email System (Nodemailer)

### Email Types
- **Reservation Confirmation** - Customer booking confirmation with table details
- **Reservation Rejection** - Cancellation notifications with alternative options
- **Reservation Request** - Initial booking acknowledgment

### Nodemailer Features
- **Gmail SMTP Integration** - Reliable email delivery through Gmail
- **HTML Email Templates** - Professional styled email designs
- **Responsive Design** - Mobile-friendly email layouts
- **Restaurant Branding** - Custom styling and branding
- **Automated Sending** - Triggered by reservation actions
- **Error Handling** - Robust error management for email failures

## 🌐 Internationalization

- **German Support** - Complete German translation
- **Multi-language Ready** - Easy to add more languages
- **Localized Content** - Date/time formatting
- **Cultural Adaptation** - Region-specific features

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch
