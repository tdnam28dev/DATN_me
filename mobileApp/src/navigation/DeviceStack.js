import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RoomScreen from '../screens/device/RoomScreen';
import DeviceScreen from '../screens/device/DeviceScreen';

const Stack = createStackNavigator();

export default function DeviceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoomScreen" component={RoomScreen} />
      <Stack.Screen name="DeviceScreen" component={DeviceScreen} />
    </Stack.Navigator>
  );
}
