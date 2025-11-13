import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import MapboxGL, { UserLocation } from '@rnmapbox/maps';
MapboxGL.setAccessToken('pk.eyJ1IjoidGRuYW0yOGRldiIsImEiOiJjbWh1eHE3bnEwNGQ5Mm1za2J3bHR0cGp3In0.y70hCep-80FDFp0xWNNvfA');
import Geolocation from '@react-native-community/geolocation';
Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'auto',
});
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/SelectLocationScreenStyle';

export default function SelectLocationScreen({ navigation, route }) {
  const [center, setCenter] = useState([105.800, 21.001]); // [longitude, latitude]
  const [zoom, setZoom] = useState(16);
  const [address, setAddress] = useState('');
  const [autoAddress, setAutoAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const mapRef = useRef(null);

  // Lấy vị trí GPS khi mở màn hình
  useEffect(() => {
    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (latitude && longitude) {
          setCenter([longitude, latitude]);
        }
      },
      (err) => {
        console.log('GPS error:', err);
      },
      { enableHighAccuracy: true}
    );
  }, []);

  // Hàm lấy tên địa điểm từ tọa độ (reverse geocoding Mapbox)
  const fetchPlaceName = async (lng, lat) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1IjoidGRuYW0yOGRldiIsImEiOiJjbWh1eHE3bnEwNGQ5Mm1za2J3bHR0cGp3In0.y70hCep-80FDFp0xWNNvfA&language=vi`
      );
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        return data.features[0].place_name || '';
      }
    } catch (e) { }
    return '';
  };

  // Khi bản đồ dừng lại, cập nhật vị trí trung tâm và lấy tên địa điểm
  const onMapIdle = async () => {
    if (mapRef.current) {
      const centerCoord = await mapRef.current.getCenter();
      setCenter(centerCoord);
      const [lng, lat] = centerCoord;
      const name = await fetchPlaceName(lng, lat);
      setAutoAddress(name);
      if (!isEditing) setAddress(name);
    }
  };

  // Xác nhận vị trí
  const handleConfirm = () => {
    if (route.params && route.params.onSelectLocation) {
      route.params.onSelectLocation({ location: center, address });
      console.log('Selected location:', center, address);
    }
    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
          <Text style={styles.confirmText}>Xác nhận</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập địa chỉ hoặc tên địa điểm"
          value={address}
          onChangeText={text => {
            setAddress(text);
            setIsEditing(true);
          }}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
        />
        {address.length > 0 && (
          <TouchableOpacity onPress={() => { setAddress(''); setIsEditing(false); }} style={styles.clearInputBtn}>
            <Icon name="close-circle" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.mapContainer}>
        <MapboxGL.MapView
          ref={mapRef}
          style={styles.map}
          onMapIdle={onMapIdle}
          logoEnabled={false}
          compassEnabled={true}
          zoomEnabled={true}
          showUserLocation={true}
        >
          <MapboxGL.Camera
            zoomLevel={zoom}
            centerCoordinate={center}
          />
          <UserLocation visible={true} showsUserHeadingIndicator={true} />
        </MapboxGL.MapView>
        <View style={styles.centerPointerContainer} pointerEvents="none">
          <View style={styles.addressLabelOnMap} pointerEvents="none">
            <Text style={[styles.addressLabelText, { textAlign: 'center' }]} numberOfLines={1} ellipsizeMode="tail">{address || autoAddress || '...'}</Text>
          </View>
          <Icon name="location" size={32} color="#FF5A5F" style={styles.centerPointer} />
        </View>
      </View>
    </View>
  );
}
