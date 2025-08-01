# Technician Dashboard

A comprehensive and modern dashboard for technicians to manage their jobs, track performance, and view analytics.

## Features

### 🎯 Real-time Dashboard

- **Live Data Integration**: Connects to the technician dashboard API endpoint
- **Auto-refresh**: Manual refresh capability with loading states
- **Error Handling**: Graceful error states with retry functionality
- **Last Updated Timestamp**: Shows when data was last refreshed

### 📊 Enhanced Statistics Cards

- **Total Jobs**: Overview of all assigned jobs
- **Active Jobs**: Currently in-progress or scheduled jobs
- **Completed Jobs**: Successfully finished jobs with completion rate
- **Overdue Jobs**: Jobs that need immediate attention
- **Total Earnings**: Financial overview with weekly trends
- **Efficiency Score**: Performance metric based on completion rate and timeliness

### 📈 Advanced Visualizations

- **Weekly Job Progress**: Combined bar and line chart showing completed vs scheduled jobs
- **Job Status Distribution**: Interactive pie chart with color-coded statuses
- **Performance Metrics**: Radial bar chart showing key performance indicators
- **Earnings Trend**: Area chart with gradient fill showing monthly earnings progression

### 💰 Payment Overview

- **Total Earnings**: Complete payment summary
- **Pending Payments**: Outstanding payments with counts
- **Payment Cards**: Visual representation of financial status

### 🔧 Job Management

- **Tabbed Interface**: Overview, Active, Completed, and Overdue job views
- **Job Cards**: Detailed job information with status badges
- **Action Buttons**: Start, pause, complete, and view job actions
- **Job Details**: Property address, job type, priority, due dates, and ratings

### 🎨 Modern UI/UX

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects and transitions
- **Color-coded Status**: Visual indicators for job status and priority
- **Loading States**: Spinner animations and skeleton loading
- **Error States**: User-friendly error messages with retry options

## API Integration

### Dashboard Data Endpoint

```typescript
GET / api / v1 / technicians / dashboard;
Authorization: Bearer<token>;
```

### Response Structure

```typescript
interface DashboardData {
  quickStats: {
    totalJobs: number;
    activeJobs: number;
    scheduledJobs: number;
    completedJobs: number;
    overdueJobs: number;
  };
  jobStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  weeklyProgress: Array<{
    day: string;
    completed: number;
    scheduled: number;
  }>;
  recentJobs: Array<{
    id: string;
    job_id: string;
    jobType: string;
    status: string;
    dueDate: string;
    updatedAt: string;
    property: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      fullAddress: string;
    };
  }>;
  paymentStats: {
    totalPayments: number;
    pendingPayments: number;
    totalAmount: number;
    pendingAmount: number;
  };
  lastUpdated: string;
}
```

## Components

### Main Dashboard

- **TechnicianDashboard**: Main component orchestrating all dashboard features
- **Statistics Cards**: Individual stat cards with icons and trends
- **Chart Components**: Recharts-based visualizations
- **Job Cards**: Individual job management cards
- **Payment Overview**: Financial summary section

### Chart Types

1. **ComposedChart**: Weekly progress with bars and lines
2. **PieChart**: Job status distribution
3. **RadialBarChart**: Performance metrics
4. **AreaChart**: Earnings trend with gradient

## Styling

### Design System

- **Color Palette**: Consistent brand colors with status-specific variations
- **Typography**: Clear hierarchy with proper font weights
- **Spacing**: Consistent padding and margins using a grid system
- **Shadows**: Subtle elevation for cards and interactive elements
- **Border Radius**: Modern rounded corners for a friendly feel

### Responsive Breakpoints

- **Desktop**: 1200px+ - Full layout with all features
- **Tablet**: 768px-1199px - Adjusted grid layouts
- **Mobile**: <768px - Single column layout with stacked elements

## Performance Features

### Data Management

- **Efficient State Management**: Optimized React state updates
- **Memoized Calculations**: Performance metrics calculated once
- **Lazy Loading**: Charts load only when visible
- **Error Boundaries**: Graceful error handling

### User Experience

- **Loading States**: Clear feedback during data fetching
- **Refresh Functionality**: Manual data refresh with visual feedback
- **Error Recovery**: Retry mechanisms for failed requests
- **Smooth Transitions**: CSS animations for state changes

## Usage

### Basic Implementation

```typescript
import TechnicianDashboard from "./pages/TechnicianDashboard/TechnicianDashboard";

// In your router or app
<Route path="/technician-dashboard" element={<TechnicianDashboard />} />;
```

### Required Dependencies

```json
{
  "react-icons": "^4.x.x",
  "recharts": "^2.x.x",
  "react": "^18.x.x"
}
```

## Future Enhancements

### Planned Features

- **Real-time Notifications**: WebSocket integration for live updates
- **Export Functionality**: PDF/Excel report generation
- **Advanced Filtering**: Date range, job type, and status filters
- **Performance Analytics**: Detailed performance breakdowns
- **Mobile App**: Native mobile application
- **Offline Support**: Service worker for offline functionality

### Analytics Improvements

- **Predictive Analytics**: Job completion time predictions
- **Performance Trends**: Historical performance analysis
- **Customer Satisfaction**: Detailed rating analytics
- **Efficiency Metrics**: Time tracking and optimization suggestions

## Contributing

When contributing to the technician dashboard:

1. **Follow the existing code style** and component structure
2. **Add proper TypeScript types** for all new features
3. **Include responsive design** considerations
4. **Test on multiple devices** and screen sizes
5. **Update documentation** for any new features
6. **Add error handling** for all API interactions

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.
