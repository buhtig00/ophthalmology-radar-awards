// Role-based permissions system

export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  JURY: 'jury',
  USER: 'user'
};

export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_CATEGORIES: 'manage_categories',
  MANAGE_PARTNERS: 'manage_partners',
  MANAGE_GITHUB: 'manage_github',
  
  // Moderator permissions
  REVIEW_CASES: 'review_cases',
  APPROVE_CASES: 'approve_cases',
  REJECT_CASES: 'reject_cases',
  VIEW_ALL_CASES: 'view_all_cases',
  
  // Jury permissions
  EVALUATE_CASES: 'evaluate_cases',
  VIEW_APPROVED_CASES: 'view_approved_cases',
  
  // User permissions
  SUBMIT_CASES: 'submit_cases',
  VOTE_CASES: 'vote_cases',
  COMMENT_CASES: 'comment_cases',
  VIEW_PUBLIC_CONTENT: 'view_public_content'
};

// Role to permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.MANAGE_PARTNERS,
    PERMISSIONS.MANAGE_GITHUB,
    PERMISSIONS.REVIEW_CASES,
    PERMISSIONS.APPROVE_CASES,
    PERMISSIONS.REJECT_CASES,
    PERMISSIONS.VIEW_ALL_CASES,
    PERMISSIONS.EVALUATE_CASES,
    PERMISSIONS.VIEW_APPROVED_CASES,
    PERMISSIONS.SUBMIT_CASES,
    PERMISSIONS.VOTE_CASES,
    PERMISSIONS.COMMENT_CASES,
    PERMISSIONS.VIEW_PUBLIC_CONTENT
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.REVIEW_CASES,
    PERMISSIONS.APPROVE_CASES,
    PERMISSIONS.REJECT_CASES,
    PERMISSIONS.VIEW_ALL_CASES,
    PERMISSIONS.VIEW_APPROVED_CASES,
    PERMISSIONS.SUBMIT_CASES,
    PERMISSIONS.VOTE_CASES,
    PERMISSIONS.COMMENT_CASES,
    PERMISSIONS.VIEW_PUBLIC_CONTENT
  ],
  [ROLES.JURY]: [
    PERMISSIONS.EVALUATE_CASES,
    PERMISSIONS.VIEW_APPROVED_CASES,
    PERMISSIONS.SUBMIT_CASES,
    PERMISSIONS.VOTE_CASES,
    PERMISSIONS.COMMENT_CASES,
    PERMISSIONS.VIEW_PUBLIC_CONTENT
  ],
  [ROLES.USER]: [
    PERMISSIONS.SUBMIT_CASES,
    PERMISSIONS.VOTE_CASES,
    PERMISSIONS.COMMENT_CASES,
    PERMISSIONS.VIEW_PUBLIC_CONTENT
  ]
};

// Check if user has specific permission
export const hasPermission = (user, permission) => {
  if (!user) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const customPermissions = user.permissions || [];
  
  return rolePermissions.includes(permission) || customPermissions.includes(permission);
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

// Check if user has all specified permissions
export const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

// Check if user has specific role
export const hasRole = (user, role) => {
  if (!user) return false;
  return user.role === role;
};

// Check if user has any of specified roles
export const hasAnyRole = (user, roles) => {
  if (!user) return false;
  return roles.includes(user.role);
};

// Get user role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.MODERATOR]: 'Moderador',
    [ROLES.JURY]: 'Jurado',
    [ROLES.USER]: 'Usuario'
  };
  return roleNames[role] || 'Usuario';
};

// Get role badge color
export const getRoleBadgeColor = (role) => {
  const colors = {
    [ROLES.ADMIN]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [ROLES.MODERATOR]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    [ROLES.JURY]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [ROLES.USER]: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };
  return colors[role] || colors[ROLES.USER];
};