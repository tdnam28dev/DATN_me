import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import HomeScreen from '../screens/HomeScreen';
import DeviceStack from './DeviceStack';
import DeviceScreen from '../screens/DeviceScreen';
import NodeScreen from '../screens/node/NodeScreen';
import SettingsScreen from '../screens/setting/SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Device') iconName = 'hardware-chip-outline';
          else if (route.name === 'Node') iconName = 'server-outline';
          else if (route.name === 'Settings') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} backgroundColor='rgba(255, 255, 255, 0)' />;
        },
        tabBarBackground: () => (
          <BlurView
            style={{ flex: 1, borderRadius: 15, }}
            blurType="light"
            blurAmount={3}
            reducedTransparencyFallbackColor="white"
          />
        ),
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#2b2b2bff',
        headerShown: false,
        tabBarStyle: {
          // backgroundColor: 'rgba(255, 255, 255, 0)', 
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 15,
          overflow: 'hidden', // Đảm bảo bo góc cho hiệu ứng kính 
          elevation: 10,
          shadowColor: 'transparent',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          position: 'absolute',
          bottom: 10,
          marginLeft: 10,
          marginRight: 10,
          height: 65,
        },
        tabBarItemStyle: {
          top: 8,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Device" component={DeviceStack}>
        {/* {props => <DeviceScreen {...props} token={token} />} */}
      </Tab.Screen>
      <Tab.Screen name="Node">
        {props => <NodeScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Settings">
        {props => <SettingsScreen {...props} />}
      </Tab.Screen>
    </Tab.Navigator>);
}