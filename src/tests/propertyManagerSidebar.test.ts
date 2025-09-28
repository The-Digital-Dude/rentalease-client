// Test Property Manager sidebar configuration

import { allowedRoutes } from '../config/roleBasedRoutes';
import { routeConfig } from '../config/routeConfig';

describe('Property Manager Sidebar Configuration', () => {

  test('should have comprehensive sidebar navigation for Property Manager', () => {
    const propertyManagerRoutes = allowedRoutes.property_manager;

    // Property Manager should have access to all essential management features
    expect(propertyManagerRoutes).toContain('dashboard');
    expect(propertyManagerRoutes).toContain('properties');
    expect(propertyManagerRoutes).toContain('contacts');
    expect(propertyManagerRoutes).toContain('agencyJobs');
    expect(propertyManagerRoutes).toContain('beyond-compliance');
    expect(propertyManagerRoutes).toContain('scheduled-jobs');
    expect(propertyManagerRoutes).toContain('overdue-jobs');
    expect(propertyManagerRoutes).toContain('completed-jobs');
    expect(propertyManagerRoutes).toContain('reports');
    expect(propertyManagerRoutes).toContain('messages');
  });

  test('should NOT have property assignment access for Property Manager', () => {
    const propertyManagerRoutes = allowedRoutes.property_manager;

    // Property Manager should NOT be able to assign properties (that's for Agencies only)
    expect(propertyManagerRoutes).not.toContain('propertyAssignment');
    expect(propertyManagerRoutes).not.toContain('propertyManagerManagement');
  });

  test('should have similar access to Agency but without administrative features', () => {
    const propertyManagerRoutes = allowedRoutes.property_manager;
    const agencyRoutes = allowedRoutes.agency;

    // Should have most agency features
    expect(propertyManagerRoutes).toContain('properties');
    expect(propertyManagerRoutes).toContain('agencyJobs');
    expect(propertyManagerRoutes).toContain('beyond-compliance');
    expect(propertyManagerRoutes).toContain('scheduled-jobs');
    expect(propertyManagerRoutes).toContain('overdue-jobs');
    expect(propertyManagerRoutes).toContain('completed-jobs');
    expect(propertyManagerRoutes).toContain('messages');

    // Should NOT have administrative features that agencies have
    expect(propertyManagerRoutes).not.toContain('propertyAssignment');
    expect(propertyManagerRoutes).not.toContain('propertyManagerManagement');
    expect(propertyManagerRoutes).not.toContain('subscription');
  });

  test('should have proper route configuration for Property Manager', () => {
    const routes = routeConfig('property_manager');

    // Should have routes configured for all allowed routes
    expect(routes).toBeDefined();
    expect(routes.length).toBeGreaterThan(5);

    // Check that key routes are properly configured
    const routePaths = routes.map(route => route.path);
    expect(routePaths).toContain('/dashboard');
    expect(routePaths).toContain('/properties');
    expect(routePaths).toContain('/agencyJobs');
    expect(routePaths).toContain('/reports');
  });

  test('should have different navigation from Technicians', () => {
    const propertyManagerRoutes = allowedRoutes.property_manager;
    const technicianRoutes = allowedRoutes.technician;

    // Property Manager should have management features that technicians don't
    expect(propertyManagerRoutes).toContain('properties');
    expect(propertyManagerRoutes).toContain('contacts');
    expect(propertyManagerRoutes).toContain('reports');

    // Property Manager should NOT have technician-specific features
    expect(propertyManagerRoutes).not.toContain('availableJobs');
    expect(propertyManagerRoutes).not.toContain('myJobs');
    expect(propertyManagerRoutes).not.toContain('myPayments');
    expect(propertyManagerRoutes).not.toContain('activeJobs');
  });

  test('should be positioned between Agency and Technician in terms of access', () => {
    const propertyManagerRoutes = allowedRoutes.property_manager;
    const agencyRoutes = allowedRoutes.agency;
    const technicianRoutes = allowedRoutes.technician;

    // Property Manager should have more access than Technicians
    expect(propertyManagerRoutes.length).toBeGreaterThan(technicianRoutes.length);

    // Property Manager should have less administrative access than Agencies
    expect(propertyManagerRoutes.length).toBeLessThan(agencyRoutes.length);

    // Key differentiators
    expect(propertyManagerRoutes).toContain('properties'); // Has property management
    expect(technicianRoutes).not.toContain('properties'); // Technicians don't

    expect(agencyRoutes).toContain('propertyAssignment'); // Agency can assign
    expect(propertyManagerRoutes).not.toContain('propertyAssignment'); // PM cannot
  });

  test('should provide full operational management capabilities', () => {
    const propertyManagerRoutes = allowedRoutes.property_manager;

    // Property Manager should be able to handle all day-to-day operations
    const operationalRoutes = [
      'dashboard',      // Overview of their portfolio
      'properties',     // Manage their assigned properties
      'agencyJobs',     // Manage jobs for their properties
      'contacts',       // Handle tenant/landlord communications
      'scheduled-jobs', // View upcoming work
      'overdue-jobs',   // Handle urgent items
      'completed-jobs', // Track completed work
      'reports',        // Generate reports for their properties
      'messages',       // Communication hub
      'beyond-compliance' // Additional services
    ];

    operationalRoutes.forEach(route => {
      expect(propertyManagerRoutes).toContain(route);
    });
  });

  test('should exclude system-wide administrative features', () => {
    const propertyManagerRoutes = allowedRoutes.property_manager;

    // Property Manager should NOT have system-wide admin features
    const adminOnlyRoutes = [
      'agencies',                    // Agency management
      'propertyManagerManagement',   // PM management
      'propertyAssignment',          // Property assignment
      'technician',                  // Technician management
      'technicianPayments',          // Payment management
      'teamMembers',                 // Team management
      'regionalDashboard',           // Regional oversight
      'subscription'                 // Billing/subscription
    ];

    adminOnlyRoutes.forEach(route => {
      expect(propertyManagerRoutes).not.toContain(route);
    });
  });
});