import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity, Text } from 'react-native';
import AuthScreen from '../screens/AuthScreen';
import TabNavigator from './TabNavigator';
import UserInfoScreen from '../screens/setting/UserInfoScreen';
import AccountSecurityScreen from '../screens/setting/AccountSecurityScreen';
import HomeManagerScreen from '../screens/setting/HomeManagerScreen';
import AddHomeScreen from '../screens/setting/AddHomeScreen';
import AddRoomScreen from '../screens/setting/AddRoomScreen';
import SelectLocationScreen from '../screens/setting/SelectLocationScreen';
import HomeSettingScreen from '../screens/setting/HomeSettingScreen';
import RoomManagerScreen from '../screens/setting/RoomManagerScreen';  
import RoomSettingScreen from '../screens/setting/RoomSettingScreen';
import NodeManagerScreen from '../screens/setting/NodeManagerScreen';
import AddNodeScreen from '../screens/setting/AddNodeScreen';
import NodeSettingScreen from '../screens/setting/NodeSettingScreen';
import DeviceManagerScreen from '../screens/setting/DeviceManagerScreen';
import AddDeviceScreen from '../screens/setting/AddDeviceScreen';
import DeviceSettingScreen from '../screens/setting/DeviceSettingScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="MainTabs">
                    {props => <TabNavigator {...props} />}
                </Stack.Screen>

                <Stack.Screen
                    name="UserInfo"
                    component={UserInfoScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Thông tin cá nhân',
                        headerTitleAlign: 'center',
                        headerStyle: {
                            backgroundColor: '#F7F5FB',
                        },
                        headerTitleStyle: {
                            fontSize: 17,
                            fontWeight: '600',
                            color: '#000',
                        },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ paddingHorizontal: 12 }}
                            >
                                <Ionicons name="chevron-back" size={22} color="#616161ff" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Tài khoản và bảo mật',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="chevron-back" size={22} color="#525252" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="HomeManager" component={HomeManagerScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Quản lý nhà',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="chevron-back" size={22} color="#525252" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="AddHome" component={AddHomeScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Thêm nhà',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_bottom',
                        gestureEnabled: true,
                    })}
                />
                <Stack.Screen name="AddRoom" component={AddRoomScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Thêm phòng',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_bottom',
                        gestureEnabled: true,
                    })}
                />
                <Stack.Screen name="SelectLocation" component={SelectLocationScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Chọn vị trí',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="chevron-back" size={22} color="#525252" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="HomeSetting" component={HomeSettingScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Cài đặt nhà',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="chevron-back" size={22} color="#525252" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="RoomManager" component={RoomManagerScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Quản lý phòng',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="chevron-back" size={22} color="#525252" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="RoomSetting" component={RoomSettingScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Cài đặt phòng',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="chevron-back" size={22} color="#525252" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="NodeManager" component={NodeManagerScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Quản lý Node',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="chevron-back" size={22} color="#525252" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="AddNode" component={AddNodeScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Thêm node',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_bottom',
                        gestureEnabled: true,
                    })}
                />
                <Stack.Screen name="NodeSetting" component={NodeSettingScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Cài đặt node',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="chevron-back" size={22} color="#525252" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="DeviceManager" component={DeviceManagerScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Quản lý thiết bị',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="chevron-back" size={22} color="#525252" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="AddDevice" component={AddDeviceScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Thêm thiết bị',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_bottom',
                        gestureEnabled: true,
                    })}
                />
                <Stack.Screen name="DeviceSetting" component={DeviceSettingScreen}
                    options={({ navigation }) => ({
                        headerShown: true,
                        title: 'Cài đặt thiết bị',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#F7F5FB', },
                        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000', },
                        headerShadowVisible: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="chevron-back" size={22} color="#525252" />
                            </TouchableOpacity>
                        ),
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>

    );
}
