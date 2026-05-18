# PWA Attendance System - Comprehensive Project Documentation

This document serves as the single source of truth for the PWA Attendance System, detailing all planned and implemented features, architectural decisions, and system capabilities.

## 1. Project Overview
The Attendance System is a high-performance Progressive Web Application (PWA) designed to provide a seamless, mobile-first experience for managing employee attendance, geofenced clock-ins, and leave requests. The application features a modern, glassmorphic UI, ensuring a visually stunning and highly responsive user experience. 

## 2. Core Features & Capabilities

### 2.1. Role-Based Access Control (RBAC)
The system implements a strict three-tier access control mechanism:
*   **Owner**: Has supreme control over the system. Can manage global settings, view all branches, oversee admins, and access comprehensive reports.
*   **Admin**: Responsible for specific branches. Can assign roles, manage branch details, define geofence parameters, approve/reject leave requests, and monitor employee attendance within their assigned scope.
*   **Employee**: The standard user. Can view their own attendance history, request leaves, and clock in/out (subject to geofence validation).

### 2.2. Advanced Geofencing & Location Tracking
To ensure attendance integrity, the system integrates robust location verification:
*   **Geofence Lock**: Employees can only clock in when they are physically present within an authorized office radius.
*   **Interactive Mapping**: Integrates `react-leaflet` to display maps visually.
*   **Live Location Feedback**: Users can see their current position relative to the authorized zone.
*   **Dynamic Geofence Configuration**: Admins and Owners can visually map branch locations and define the acceptable radius for clock-ins directly from the control center.

### 2.3. Leave Management System
A comprehensive workflow for handling employee absences:
*   **Request Portal**: Employees can submit leave requests specifying dates and reasons.
*   **Approval Workflow**: Admins and Owners receive notifications for pending requests and can approve or reject them.
*   **Status Tracking**: Employees can track the real-time status of their requests.

### 2.4. Admin Control Center
An interactive dashboard empowering management with full operational oversight:
*   **Roster Management**: Dynamically manage team rosters and assign roles.
*   **Branch Configuration**: Add, edit, and map new branch locations.
*   **Real-time Analytics**: View daily attendance stats, late arrivals, and absent employees.

### 2.5. Offline-First PWA Capabilities
Built for reliability even in poor network conditions:
*   **Service Workers**: Utilizes Vite PWA plugins to cache essential assets and provide an installable web app experience.
*   **Offline Sync**: Capable of queuing certain actions and synchronizing with the backend once connectivity is restored.

## 3. Design & User Experience
*   **Glassmorphism**: The UI heavily features frosted glass effects, vibrant gradients, and modern aesthetics to create a premium feel.
*   **Mobile-First**: Designed primarily for mobile usage (as a PWA), ensuring touch-friendly interfaces, responsive layouts, and smooth micro-animations.
*   **Dynamic UI**: Real-time updates and interactive elements to keep the interface engaging.

## 4. Technical Stack
*   **Frontend Framework**: React 19 / Vite
*   **Routing**: React Router v7
*   **State Management**: Zustand
*   **Mapping**: Leaflet & React-Leaflet
*   **Backend & Database**: Supabase (PostgreSQL, Authentication)
*   **Styling**: Vanilla CSS with modern custom properties (`index.css`), implementing the glassmorphism design system.
*   **Utilities**: `date-fns` for time management, `geolib` for distance calculations, `xlsx` for export functionalities.

## 5. Development Workflow
*   **Local Server**: Run `npm run dev` to start the Vite local development server.
*   **PWA Build**: Run `npm run build` to generate the production-ready PWA bundle.

## 6. Future Enhancements (Roadmap)
*   Integration with biometric web APIs for enhanced authentication.
*   Advanced reporting and data export for payroll integration.
*   Automated notifications (Email/SMS) for leave approvals and attendance anomalies.
