import { theme } from '../../../theme';

const LEVEL_COLORS = {
  ORO: '#b8860b',
  PLATA: '#adb5bd',
  BRONCE: '#d9480f',
};

export const getClientLevel = (client = {}) => client.level || 'BRONCE';

export const getClientLevelColor = (level) => LEVEL_COLORS[level] || theme.colors.textSecondary;
