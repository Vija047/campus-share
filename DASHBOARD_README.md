# Campus Share Dashboard

## Overview
A comprehensive student dashboard for the Campus Share platform featuring a clean and modern design with essential academic tools and features.

## Features

### 🏠 **Dashboard**
- **Quick Stats**: View total notes, community posts, bookmarked items, and recent activity
- **Recently Viewed**: Access recently viewed notes and question papers
- **Profile Summary**: Quick view of student information (department, semester, notes uploaded)
- **Community Activity**: Latest posts and discussions from the community
- **Quick Actions**: Fast access to upload notes, join community, and start chat

### 👤 **Profile Management**
- **Editable Profile**: Update personal information including:
  - Full name and email address
  - Department selection (Computer Science, IT, Electronics, etc.)
  - Current semester (1-8)
  - Gender pronouns (He/Him, She/Her, They/Them)
  - Bio section for personal description
- **Profile Picture**: Upload and manage profile pictures
- **Activity Statistics**: View notes uploaded, likes received, and membership duration

### 🔖 **Bookmarks System**
- **Saved Notes**: Access all bookmarked notes and study materials
- **Advanced Search**: Filter bookmarks by subject, search by title/description/author
- **Detailed Cards**: Each bookmark shows:
  - Title, subject, and author information
  - Upload date and download count
  - Description and file type
  - Bookmark date for organization
- **Quick Actions**: View, download, or remove bookmarks

### 🎨 **Design Features**
- **Modern UI**: Clean, card-based design with subtle shadows and hover effects
- **Responsive Layout**: Fully responsive design that works on desktop, tablet, and mobile
- **Color-Coded Stats**: Different colors for different types of statistics
- **Intuitive Navigation**: Clear navigation with icons and organized sections
- **Loading States**: Smooth loading indicators for better user experience

### 📱 **User Experience**
- **Quick Access**: Fast navigation to frequently used features
- **Visual Feedback**: Hover effects, transitions, and visual cues
- **Organized Layout**: Logical grouping of related information
- **Search & Filter**: Easy content discovery and organization
- **Progressive Enhancement**: Works with JavaScript disabled (basic functionality)

## Technical Implementation

### Components Structure
```
src/
├── pages/
│   ├── Dashboard.jsx      # Main dashboard with stats and overview
│   ├── Profile.jsx        # Profile management and editing
│   └── Bookmarks.jsx      # Bookmarked notes management
├── components/
│   ├── common/
│   │   ├── Button.jsx     # Reusable button with icon support
│   │   ├── Input.jsx      # Form input component
│   │   ├── Select.jsx     # Dropdown select component
│   │   └── LoadingSpinner.jsx # Loading indicator
│   └── layout/
│       └── Header.jsx     # Navigation with bookmarks link
```

### State Management
- **React Context**: Uses AuthContext for user state management
- **Local State**: Component-level state for form handling and UI state
- **Mock Data**: Currently using mock data for development (API integration ready)

### Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid development
- **Custom CSS**: Additional styles for enhanced visual effects
- **Responsive Design**: Mobile-first approach with breakpoints

## Getting Started

1. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Start the Backend**:
   ```bash
   cd backend
   npm start
   ```

3. **Access the Dashboard**:
   - Navigate to `http://localhost:3001`
   - Login or register to access the dashboard
   - Explore the Dashboard, Profile, and Bookmarks sections

## Future Enhancements

### Planned Features
- [ ] Real-time notifications for community activity
- [ ] Advanced analytics and insights
- [ ] Note recommendations based on user activity
- [ ] Study group integration
- [ ] Calendar integration for academic schedules
- [ ] Dark mode theme option
- [ ] Offline mode for bookmarked content

### API Integration
- [ ] Dashboard statistics endpoint
- [ ] Profile update endpoint
- [ ] Bookmarks management endpoints
- [ ] Real-time activity feeds
- [ ] File upload for profile pictures

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Features
- Lazy loading for images and components
- Optimized bundle size with code splitting
- Responsive images with multiple formats
- Caching for frequently accessed data
