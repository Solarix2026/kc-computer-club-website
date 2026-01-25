/**
 * Theme color constants for Admin and Student sections
 */

// Admin Theme - Blue
export const ADMIN_THEME = {
  primary: '#137fec', // Blue
  primaryLight: '#137fec20', // Blue with opacity
  primaryHover: '#0f5dc1', // Darker blue
  background: '#0a1220', // Dark blue-black
  backgroundSecondary: '#162a33', // Secondary dark blue
  border: '#283940', // Blue-tinted border
  text: {
    primary: '#ffffff',
    secondary: '#9db9ab', // Slightly different tone for secondary
  },
};

// Student Theme - Mint
export const STUDENT_THEME = {
  primary: '#13ec80', // Mint/Green
  primaryLight: '#13ec8020', // Mint with opacity
  primaryHover: '#0fd673', // Darker mint
  background: '#102219', // Dark green
  backgroundSecondary: '#1a2c23', // Secondary dark green
  border: '#283930', // Green-tinted border
  text: {
    primary: '#ffffff',
    secondary: '#9db9ab',
  },
};

/**
 * Get theme based on user type
 */
export function getTheme(isAdmin: boolean) {
  return isAdmin ? ADMIN_THEME : STUDENT_THEME;
}
