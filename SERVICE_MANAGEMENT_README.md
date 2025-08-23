# Service Management System with Agent Functionality

## Overview

This document describes the comprehensive service management system implemented for the VaquaH AC Services platform. The system includes agent registration, service management, location-based agent assignment, and administrative oversight.

## Features

### 1. Agent Management
- **Agent Registration**: Users can apply to become agents through a comprehensive application form
- **Admin Approval**: Admins can review and approve/reject agent applications
- **Agent Profiles**: Complete agent profiles with contact details, services offered, and performance metrics
- **Location Tracking**: Agents can update their location for service area matching

### 2. Service Management
- **Service Requests**: Customers can create service requests with detailed requirements
- **Agent Assignment**: Admins can assign agents to service requests based on location and availability
- **Service Tracking**: Real-time status updates for service requests
- **Payment Processing**: Automatic calculation of admin and agent cuts (15% admin, 85% agent)

### 3. Location-Based Services
- **5km Radius**: Agents are matched to customers within a 5km radius
- **Geolocation**: Automatic location detection and updates
- **Service Area Management**: Efficient agent-customer matching

### 4. Administrative Features
- **Comprehensive Dashboard**: View all agents, applications, and service requests
- **Performance Metrics**: Track agent performance, earnings, and service completion rates
- **Financial Management**: Monitor admin cuts and agent earnings
- **Application Management**: Review and process agent applications

## Database Collections

### 1. `agentApplications`
Stores agent application data:
```javascript
{
  uid: string,
  email: string,
  name: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  pincode: string,
  services: string[],
  experience: string,
  documents: {
    idProof: string,
    addressProof: string,
    experienceCertificate: string
  },
  status: 'pending' | 'approved' | 'rejected',
  appliedAt: timestamp,
  reviewedBy: string,
  reviewedAt: timestamp,
  notes: string
}
```

### 2. `agents`
Stores approved agent profiles:
```javascript
{
  uid: string,
  email: string,
  name: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  pincode: string,
  services: string[],
  experience: string,
  documents: object,
  status: 'active' | 'inactive',
  rating: number,
  totalServices: number,
  totalEarnings: number,
  location: {
    latitude: number,
    longitude: number,
    lastUpdated: timestamp
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. `serviceRequests`
Stores customer service requests:
```javascript
{
  userId: string,
  userEmail: string,
  userName: string,
  userPhone: string,
  userAddress: string,
  serviceType: string,
  description: string,
  preferredDate: string,
  preferredTime: string,
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
  assignedAgent: string,
  agentId: string,
  estimatedPrice: number,
  finalPrice: number,
  paymentStatus: 'pending' | 'completed',
  paymentMethod: string,
  adminCut: number,
  agentCut: number,
  adminAmount: number,
  agentAmount: number,
  createdAt: timestamp,
  updatedAt: timestamp,
  completedAt: timestamp
}
```

## User Roles

### 1. Customer (Default Role)
- Create service requests
- View service status
- Track service history

### 2. Agent
- View assigned services
- Update service status
- Track earnings and performance
- Update location

### 3. Admin
- Manage agent applications
- Assign agents to services
- View all service requests
- Monitor financial metrics
- Manage agent profiles

## Key Components

### 1. ApplyAsAgent.jsx
- Comprehensive application form
- Document upload support
- Application status tracking
- Service selection

### 2. AgentDashboard.jsx
- Agent profile management
- Service request handling
- Location updates
- Earnings tracking

### 3. ServicesAdmin.jsx
- Agent management interface
- Application review system
- Service assignment tools
- Performance monitoring

### 4. agentService.js
- Complete agent service layer
- Location-based agent finding
- Service request management
- Payment processing

## Workflow

### Agent Registration Process
1. User applies through `/apply-agent` page
2. Admin reviews application in `/admin/services`
3. Admin approves/rejects application
4. If approved, user role changes to 'agent'
5. Agent profile is created automatically

### Service Request Process
1. Customer creates service request
2. Admin assigns agent based on location and availability
3. Agent receives notification and updates status
4. Service is completed and payment is processed
5. Admin and agent cuts are calculated automatically

### Location-Based Matching
1. Agent updates location via dashboard
2. System calculates 5km radius from agent location
3. Admin can assign services to agents within range
4. Automatic distance calculation using Haversine formula

## Security Rules

### Firestore Rules
- Agent applications: Users can create their own, admins can read/update all
- Agents: Agents can read/update their own profile, admins have full access
- Service requests: Users can create their own, agents can update assigned services, admins have full access

### Role-Based Access
- Customer: Basic service request functionality
- Agent: Service management and profile updates
- Admin: Full system access and management

## Financial Model

### Revenue Split
- **Admin Cut**: 15% of service charge
- **Agent Cut**: 85% of service charge
- **Automatic Calculation**: System calculates splits on service completion

### Payment Tracking
- Estimated vs final pricing
- Payment method tracking
- Earnings history for agents
- Revenue reports for admins

## Technical Implementation

### Location Services
- Browser geolocation API
- Haversine distance calculation
- Real-time location updates
- 5km radius filtering

### State Management
- React hooks for local state
- Firebase real-time updates
- Optimistic UI updates
- Error handling and recovery

### Performance Optimization
- Parallel data fetching
- Efficient filtering and search
- Lazy loading of components
- Cached data management

## Usage Instructions

### For Customers
1. Navigate to "Schedule Service" to create a service request
2. Fill in service details and preferred time
3. Wait for agent assignment and updates
4. Track service progress through dashboard

### For Agents
1. Apply through "Apply as Agent" page
2. Wait for admin approval
3. Access agent dashboard after approval
4. Update location and manage services
5. Track earnings and performance

### For Admins
1. Access admin dashboard
2. Review agent applications in Services Management
3. Assign agents to service requests
4. Monitor system performance and metrics
5. Manage agent profiles and permissions

## Future Enhancements

### Planned Features
- Real-time notifications
- Mobile app development
- Advanced analytics dashboard
- Payment gateway integration
- Rating and review system
- Automated agent assignment
- Service scheduling optimization

### Technical Improvements
- Push notifications
- Offline support
- Advanced search and filtering
- Performance monitoring
- Automated testing
- API rate limiting

## Support and Maintenance

### Monitoring
- Service request volumes
- Agent performance metrics
- System response times
- Error rates and debugging

### Maintenance Tasks
- Regular data backups
- Performance optimization
- Security updates
- Feature enhancements

## Conclusion

The service management system provides a comprehensive solution for managing AC services with agent functionality. It includes robust user management, location-based services, financial tracking, and administrative oversight. The system is designed to be scalable, secure, and user-friendly while providing valuable insights and control for all stakeholders.