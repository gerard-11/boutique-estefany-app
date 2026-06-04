import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    marginBottom: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d63384',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  logoutLabel: {
    fontWeight: 'bold',
  },
});
