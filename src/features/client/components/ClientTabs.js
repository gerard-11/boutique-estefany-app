import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../screens/ClientHomeScreen.styles';

export default function ClientTabs({ tabs, activeTab, onChangeTab }) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
          onPress={() => onChangeTab(tab.id)}
        >
          <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
