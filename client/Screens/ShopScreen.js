import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import MY_IP_ADDRESS from '../environment_variables.mjs';

const ShopScreen = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.token);
  const navigation = useNavigation();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://${MY_IP_ADDRESS}:5050/vendor/shop/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShops(data.vendors || []);
      } else {
        setError(data.message || 'Failed to fetch shops');
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleShopPress = (shop) => {
    if (shop.shop_info?.shop_now_link) {
      navigation.navigate('Shop Now Webview', { uri: shop.shop_info.shop_now_link });
    } else {
      Alert.alert('No Website', 'This shop does not have a website link.');
    }
  };

  const handleInstagramPress = (shop) => {
    if (shop.shop_info?.intro) {
      navigation.navigate('Shop Now Webview', { uri: shop.shop_info.intro });
    } else {
      Alert.alert('No Instagram', 'This shop does not have an Instagram link.');
    }
  };

  const renderShopItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.shopCard}
      onPress={() => handleShopPress(item)}
    >
      <View style={styles.shopContent}>
        {item.shop_info?.title ? (
          <Image 
            source={{ uri: item.shop_info.title }} 
            style={styles.shopImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>{item.shop_info?.brand_name?.charAt(0) || '?'}</Text>
          </View>
        )}
        
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{item.shop_info?.brand_name || 'Unknown Shop'}</Text>
          <Text style={styles.vendorName}>by {item.first_name} {item.last_name}</Text>
          
          <View style={styles.linkContainer}>
            {item.shop_info?.shop_now_link && (
              <TouchableOpacity 
                onPress={() => handleShopPress(item)}
              >
                <Text style={styles.linkText}>Visit Website</Text>
              </TouchableOpacity>
            )}
            
            {item.shop_info?.intro && (
              <TouchableOpacity 
                onPress={() => handleInstagramPress(item)}
                style={styles.instagramButton}
              >
                <FontAwesome name="instagram" size={20} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#02833D" />
        <Text style={styles.loadingText}>Loading shops...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchShops}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (shops.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noShopsText}>No shops available at the moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={shops}
        renderItem={renderShopItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  shopCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  shopContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#02833D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  shopInfo: {
    flex: 1,
    marginLeft: 16,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  linkButton: {
    backgroundColor: '#02833D',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  linkText: {
    color: '#0066cc',
    fontWeight: '500',
    textDecorationLine: 'underline',
    marginRight: 12,
  },
  instagramButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#02833D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
  noShopsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ShopScreen;
