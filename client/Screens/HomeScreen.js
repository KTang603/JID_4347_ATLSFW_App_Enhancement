import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { getToken } from "../utils/StorageUtils";
import { HEADER_LOGO } from "../assets";
import AppPrimaryButton from "../components/AppPrimaryButton";

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredBrands, setFeaturedBrands] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const navigation = useNavigation();
  const token = useSelector((store) => store.token.token);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch all home page data in a single request
      const response = await fetch("http://localhost:5050/home/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data.upcomingEvents || []);
        setFeaturedBrands(data.featuredBrands || []);
        setWorkshops(data.workshops || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching home data:", error);
      setLoading(false);
      
      // Set some dummy data for demonstration
      setUpcomingEvents([
        {
          _id: "1",
          title: "Atlanta Sustainable Fashion Week 2025",
          date: "April 15-20, 2025",
          location: "Ponce City Market, Atlanta",
          image: "https://example.com/event1.jpg",
        },
        {
          _id: "2",
          title: "Eco-Fashion Showcase",
          date: "May 5, 2025",
          location: "High Museum of Art, Atlanta",
          image: "https://example.com/event2.jpg",
        },
      ]);
      
      setFeaturedBrands([
        {
          _id: "1",
          name: "EcoThreads",
          description: "Sustainable clothing made from recycled materials",
          image: "https://example.com/brand1.jpg",
        },
        {
          _id: "2",
          name: "Green Stitch",
          description: "Handcrafted accessories using eco-friendly materials",
          image: "https://example.com/brand2.jpg",
        },
        {
          _id: "3",
          name: "Terra Wear",
          description: "Biodegradable fashion for conscious consumers",
          image: "https://example.com/brand3.jpg",
        },
      ]);
      
      setWorkshops([
        {
          _id: "1",
          title: "Clothing Repair Workshop",
          date: "April 16, 2025",
          time: "2:00 PM - 4:00 PM",
          location: "Community Center, Atlanta",
          description: "Learn how to repair and extend the life of your clothing",
        },
        {
          _id: "2",
          title: "Sustainable Fabric Dyeing",
          date: "April 18, 2025",
          time: "10:00 AM - 12:00 PM",
          location: "Piedmont Park, Atlanta",
          description: "Natural dyeing techniques using plant-based materials",
        },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  const renderEventItem = (event) => (
    <TouchableOpacity 
      key={event._id}
      style={styles.eventCard}
      onPress={() => navigation.navigate("Events", { eventId: event._id })}
    >
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>{event.date}</Text>
        <Text style={styles.eventLocation}>{event.location}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderBrandItem = (brand) => (
    <TouchableOpacity 
      key={brand._id}
      style={styles.brandCard}
      onPress={() => navigation.navigate("Shop Now Webview", { vendorId: brand._id })}
    >
      <View style={styles.brandImageContainer}>
        {brand.image ? (
          <Image source={{ uri: brand.image }} style={styles.brandImage} />
        ) : (
          <View style={[styles.brandImage, styles.placeholderImage]}>
            <Ionicons name="shirt" size={30} color="#02833D" />
          </View>
        )}
      </View>
      <Text style={styles.brandName}>{brand.name}</Text>
      <Text style={styles.brandDescription} numberOfLines={2}>{brand.description}</Text>
    </TouchableOpacity>
  );

  const renderWorkshopItem = (workshop) => (
    <TouchableOpacity 
      key={workshop._id}
      style={styles.workshopCard}
      onPress={() => navigation.navigate("Events", { eventId: workshop._id })}
    >
      <View style={styles.workshopHeader}>
        <Ionicons name="construct" size={24} color="#02833D" />
        <Text style={styles.workshopTitle}>{workshop.title}</Text>
      </View>
      <Text style={styles.workshopDate}>{workshop.date} • {workshop.time}</Text>
      <Text style={styles.workshopLocation}>{workshop.location}</Text>
      <Text style={styles.workshopDescription} numberOfLines={2}>{workshop.description}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#02833D" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#02833D"]} />
      }
    >

      {/* Upcoming Events Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Events")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventsContainer}>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(renderEventItem)
          ) : (
            <Text style={styles.noDataText}>No upcoming events at this time</Text>
          )}
        </View>
      </View>

      {/* Ticket Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Get Your Tickets</Text>
        </View>
        <TouchableOpacity 
          style={styles.ticketCard}
          onPress={() => navigation.navigate("Shop Now Webview", { url: "https://www.sustainablefw.com/event-details/earth-day-fashion-show-x-atlanta-film-festival" })}
        >
          <View style={styles.ticketContent}>
            <Text style={styles.ticketTitle}>Atlanta Sustainable Fashion Week 2025</Text>
            <Text style={styles.ticketDescription}>
              Secure your spot at the event. Early bird tickets available now!
            </Text>
            <View style={styles.ticketButton}>
              <Text style={styles.ticketButtonText}>Purchase Tickets</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Participating Brands */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Participating Brands</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Shop Now Webview")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.brandsContainer}>
          {featuredBrands.length > 0 ? (
            featuredBrands.map(renderBrandItem)
          ) : (
            <Text style={styles.noDataText}>No brands to display</Text>
          )}
        </View>
      </View>

      {/* Workshops & Repair Cafe */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workshops & Repair Cafe</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Events", { filter: "workshops" })}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.workshopsContainer}>
          {workshops.length > 0 ? (
            workshops.map(renderWorkshopItem)
          ) : (
            <Text style={styles.noDataText}>No workshops scheduled at this time</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    color: "#02833D",
    fontSize: 16,
  },
  banner: {
    backgroundColor: "#02833D",
    padding: 20,
    alignItems: "center",
  },
  bannerLogo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  bannerSubtitle: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
  },
  section: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    color: "#02833D",
    fontSize: 14,
    fontWeight: "500",
  },
  eventsContainer: {
    gap: 15,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  eventImageContainer: {
    width: 100,
    height: 100,
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    backgroundColor: "#e0f2f1",
    justifyContent: "center",
    alignItems: "center",
  },
  eventInfo: {
    flex: 1,
    padding: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: "#02833D",
    marginBottom: 3,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
  },
  ticketCard: {
    backgroundColor: "#e0f2f1",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  ticketContent: {
    padding: 15,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  ticketDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  ticketButton: {
    backgroundColor: "#02833D",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  ticketButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  brandsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  brandCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 15,
  },
  brandImageContainer: {
    width: "100%",
    height: 120,
  },
  brandImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  brandName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    padding: 10,
    paddingBottom: 5,
  },
  brandDescription: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  workshopsContainer: {
    gap: 15,
  },
  workshopCard: {
    borderRadius: 8,
    padding: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  workshopHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  workshopTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  workshopDate: {
    fontSize: 14,
    color: "#02833D",
    marginBottom: 5,
  },
  workshopLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  workshopDescription: {
    fontSize: 14,
    color: "#666",
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
});

export default HomeScreen;
