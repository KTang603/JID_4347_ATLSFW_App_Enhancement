import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from "@expo/vector-icons";
import { SHOP_ALL_API } from '../utils/ApiUtils';
import axios from 'axios';
import MY_IP_ADDRESS from '../environment_variables.mjs';
import { handleApiError } from '../utils/ApiErrorHandler';

// Extracted component for Shop Item
const ShopItem = ({ shop, isAdmin, onShopPress, onInstagramPress, onDeleteShop }) => (
  <View style={styles.shopCard}>
    <View style={styles.shopContent}>
      {/* Shop Image Banner */}
      {shop.shop_info?.url ? (
        <Image 
          source={{ uri: shop.shop_info.url }} 
          style={styles.shopImage}
        />
      ) : shop.shop_info?.title ? (
        <Image 
          source={{ uri: shop.shop_info.title }} 
          style={styles.shopImage}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>{shop.shop_info?.brand_name?.charAt(0) || '?'}</Text>
        </View>
      )}
      
      {/* Shop Info Section */}
      <View style={styles.shopInfo}>
        {/* Header Row with Shop Name and Instagram Link */}
        <View style={styles.headerRow}>
          {/* Shop Name - Clickable if shop_now_link exists */}
          <TouchableOpacity 
            onPress={() => onShopPress(shop)}
            disabled={!shop.shop_info?.shop_now_link}
            style={styles.shopNameContainer}
          >
            <Text style={[
              styles.shopName, 
              shop.shop_info?.shop_now_link ? styles.clickableText : null
            ]}>
              {shop.shop_info?.brand_name || 'Unknown Shop'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.actionButtons}>
            {/* Social Media Link */}
            {(shop.shop_info?.social_link || shop.shop_info?.intro) && (
              <TouchableOpacity 
                onPress={() => onInstagramPress(shop)}
                style={styles.instagramButton}
              >
                <FontAwesome name="instagram" size={22} color="#C13584" />
              </TouchableOpacity>
            )}
            
            {/* Delete Button - Only visible to admins */}
            {isAdmin && (
              <TouchableOpacity 
                onPress={() => onDeleteShop(shop._id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#d32f2f" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  </View>
);

// API service to centralize API calls
const shopService = {
  getAll: async (token) => {
    const response = await fetch(SHOP_ALL_API, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  },
  
  deleteShop: async (shopId, token) => {
    return axios({
      method: 'DELETE',
      url: `http://${MY_IP_ADDRESS}:5050/admin/shops/${shopId}`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Utility function for handling shop links
const getShopLinks = (shop) => {
  return {
    hasShopLink: !!shop.shop_info?.shop_now_link,
    shopLink: shop.shop_info?.shop_now_link,
    hasSocialLink: !!(shop.shop_info?.social_link || shop.shop_info?.intro),
    socialLink: shop.shop_info?.social_link || shop.shop_info?.intro
  };
};

const ShopScreen = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userInfo = useSelector((state) => state.userInfo?.userInfo);
  const token = useSelector((state) => state.userInfo?.token);
  const isAdmin = userInfo?.user_roles === 3; // Check if user is admin (role 3)
  
  const navigation = useNavigation();

  // Fetch shops with error handling
  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await shopService.getAll(token);
      const data = await response.json();
      
      if (response.ok) {
        setShops(data.vendors || []);
      } else {
        // Check if this is a deactivated account error
        if (response.status === 403 && data.code === 'ACCOUNT_DEACTIVATED') {
          await handleApiError({ response: { status: 403, data: { code: 'ACCOUNT_DEACTIVATED' } } }, navigation);
        } else {
          setError(data.message || 'Failed to fetch shops');
        }
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
      // Try to handle the error with the API error handler
      const errorHandled = await handleApiError(err, navigation);
      if (!errorHandled) {
        setError('Network error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigation]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Handlers for user actions
  const handleShopPress = useCallback((shop) => {
    const { hasShopLink, shopLink } = getShopLinks(shop);
    
    if (hasShopLink) {
      navigation.navigate('Shop Now Webview', { link: shopLink });
    } else {
      Alert.alert('No Website', 'This shop does not have a website link.');
    }
  }, [navigation]);

  const handleInstagramPress = useCallback((shop) => {
    const { hasSocialLink, socialLink } = getShopLinks(shop);
    
    if (hasSocialLink) {
      navigation.navigate('Shop Now Webview', { link: socialLink });
    } else {
      Alert.alert('No Social Media', 'This shop does not have a social media link.');
    }
  }, [navigation]);

  const handleDeleteShop = useCallback((shopId) => {
    Alert.alert(
      "Delete Shop",
      "Are you sure you want to delete this shop? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await shopService.deleteShop(shopId, token);
              
              if (response.status === 200) {
                // Remove the deleted shop from the shops array
                setShops(prevShops => prevShops.filter(shop => shop._id !== shopId));
                Alert.alert('Success', 'Shop deleted successfully');
              }
            } catch (error) {
              // Try to handle the error with the API error handler
              const errorHandled = await handleApiError(error, navigation);
              if (!errorHandled) {
                Alert.alert('Error', error.response?.data?.message || 'Failed to delete shop');
              }
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }, [token, navigation]);

  // Render functions conditionally
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
        renderItem={({ item }) => (
          <ShopItem 
            shop={item}
            isAdmin={isAdmin}
            onShopPress={handleShopPress}
            onInstagramPress={handleInstagramPress}
            onDeleteShop={handleDeleteShop}
          />
        )}
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
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  shopContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  shopImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#02833D',
  },
  shopInfo: {
    padding: 16,
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkButton: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: '#02833D',
    fontWeight: '600',
    fontSize: 15,
  },
  instagramButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  clickableText: {
    color: '#02833D',
    textDecorationLine: 'underline',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopNameContainer: {
    flex: 1,
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ShopScreen;
