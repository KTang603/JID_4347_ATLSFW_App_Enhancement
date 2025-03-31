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
  Modal,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { handleApiError } from "../utils/ApiErrorHandler";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import axios from "axios";

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredBrands, setFeaturedBrands] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigation = useNavigation();
  const token = useSelector((store) => store.token.token);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch all home page data in a single request
      // const response = await fetch(`http://${MY_IP_ADDRESS}:5050/home/all`, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      const response = await axios.get(`http://${MY_IP_ADDRESS}:5050/home/all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        const data = response.data;
        setUpcomingEvents(data.upcomingEvents || []);
        
        // Always use mock data for featured brands
        const mockBrands = [
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
        ];
        setFeaturedBrands(mockBrands);
        setWorkshops(data.workshops || []);
      }
      // }else if(response.status === 403){ 
      //   handleApiError(response,navigation)
      // }
      
      setLoading(false);
    } catch (error) {
      // console.error("Error fetching home data:", error);
      
      // Check if this is a deactivated account error
      const errorHandled = await handleApiError(error, navigation);
      
      // If the error wasn't handled as a deactivated account, continue with default handling
      if (!errorHandled) {
        setLoading(false);
        
        // Set empty arrays for events and workshops to show "Coming Soon!" messages
        setUpcomingEvents([]);
        setWorkshops([]);
        
        // Set mock data for featured brands
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
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  // Helper function to format time from 24-hour to 12-hour format
  const formatTime = (time) => {
    if (!time) return "";
    
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  const renderEventItem = (event) => (
    <TouchableOpacity 
      key={event._id}
      style={styles.eventCard}
      onPress={() => showEventDetails(event)}
    >
      <View style={styles.eventInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.eventTitle}>{event.event_title || event.title || "Untitled Event"}</Text>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation(); // Prevent card click
              showEventDetails(event);
            }}
            style={styles.optionsButton}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
        
        {/* Description - make sure we're not displaying URLs */}
        {(event.event_desc || event.description) && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {/* Filter out URLs from description */}
            {(() => {
              const desc = event.event_desc || event.description;
              // Check if the description is a URL
              if (desc && (desc.startsWith('http://') || desc.startsWith('https://'))) {
                return "Click for event details";
              }
              return desc;
            })()}
          </Text>
        )}
        
        {/* Date and Time - moved to bottom */}
        <Text style={[styles.eventDate, { marginTop: 5 }]}>
          {event.event_date || event.date || "No date"}
          {event.event_time ? ` • ${formatTime(event.event_time)}` : ""}
        </Text>
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
      onPress={() => showEventDetails(workshop)}
    >
      <View style={styles.workshopHeader}>
        <Ionicons name="construct" size={24} color="#02833D" />
        <Text style={styles.workshopTitle}>{workshop.event_title || workshop.title || "Untitled Workshop"}</Text>
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation(); // Prevent card click
            showEventDetails(workshop);
          }}
          style={styles.optionsButton}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#aaa" />
        </TouchableOpacity>
      </View>
      
      {/* Description */}
      {(workshop.event_desc || workshop.description) && (
        <Text style={styles.eventDescription} numberOfLines={2}>
          {/* Filter out URLs from description */}
          {(() => {
            const desc = workshop.event_desc || workshop.description;
            // Check if the description is a URL
            if (desc && (desc.startsWith('http://') || desc.startsWith('https://'))) {
              return "Click for workshop details";
            }
            return desc;
          })()}
        </Text>
      )}
      
      {/* Date and Time - moved to bottom */}
      <Text style={[styles.workshopDate, { marginTop: 5 }]}>
        {workshop.event_date || workshop.date || "No date"} 
        {workshop.event_time ? ` • ${formatTime(workshop.event_time)}` : workshop.time ? ` • ${workshop.time}` : ""}
      </Text>
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

  // Helper function to format event date and time
  const formatEventDateTime = (dateStr, startTime, endTime) => {
    if (!dateStr) return "";
    
    // Parse the date - ensure we're using the correct date by handling timezone issues
    // Format: YYYY-MM-DD (e.g., 2025-03-29)
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    
    // Create date using UTC to avoid timezone issues (months are 0-indexed in JS)
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Get day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[date.getUTCDay()];
    
    // Get month
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = months[date.getUTCMonth()];
    
    // Format date - use UTC methods to avoid timezone issues
    const dayOfMonth = date.getUTCDate();
    
    // Format the full date and time string
    let formattedDateTime = `${dayOfWeek}, ${monthName} ${dayOfMonth}`;
    
    if (startTime) {
      formattedDateTime += ` · ${formatTime(startTime)}`;
      
      if (endTime) {
        formattedDateTime += ` - ${formatTime(endTime)}`;
      }
    }
    
    return formattedDateTime;
  };

  // Function to show event details modal
  const showEventDetails = (event) => {
    setSelectedEvent(event);
    setEventDetailsVisible(true);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#02833D"]} />
      }
    >
      {/* Event Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={eventDetailsVisible}
        onRequestClose={() => setEventDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.eventDetailsModalContent}>
            {selectedEvent && (
              <>
                <View style={styles.eventDetailsHeader}>
                  <Text style={styles.eventDetailsTitle}>{selectedEvent.event_title || selectedEvent.title || "Untitled Event"}</Text>
                  <TouchableOpacity 
                    onPress={() => setEventDetailsVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.eventDetailsScrollView}>
                  {/* Date and Time */}
                  <View style={styles.eventDetailSection}>
                    <Text style={styles.eventDetailLabel}>Date & Time</Text>
                      <Text style={styles.eventDetailText}>
                        {formatEventDateTime(selectedEvent.event_date, selectedEvent.event_time, selectedEvent.event_end_time)}
                      </Text>
                  </View>
                  
                  {/* Location */}
                  <View style={styles.eventDetailSection}>
                    <Text style={styles.eventDetailLabel}>Location</Text>
                    <Text style={styles.eventDetailText}>
                      {selectedEvent.event_location || selectedEvent.location || "No location provided"}
                    </Text>
                  </View>
                  
                  {/* Description */}
                  {(selectedEvent.event_desc || selectedEvent.description) && (
                    <View style={styles.eventDetailSection}>
                      <Text style={styles.eventDetailLabel}>Description</Text>
                      <Text style={styles.eventDetailText}>
                        {selectedEvent.event_desc || selectedEvent.description}
                      </Text>
                    </View>
                  )}
                  
                  {/* Links */}
                  {selectedEvent.event_link && (
                    <View style={styles.eventDetailSection}>
                      <Text style={styles.eventDetailLabel}>Event Link</Text>
                      <TouchableOpacity
                        onPress={() => Linking.openURL(selectedEvent.event_link)}
                      >
                        <Text style={styles.eventDetailLink}>
                          Open Event Link
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Ticket URL if available */}
                  {selectedEvent.ticket_url && (
                    <View style={styles.eventDetailSection}>
                      <Text style={styles.eventDetailLabel}>Tickets</Text>
                      <TouchableOpacity
                        onPress={() => Linking.openURL(selectedEvent.ticket_url)}
                      >
                        <Text style={styles.eventDetailLink}>
                          Get Tickets
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Upcoming Events Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Events", { filterType: "regular", showAll: true })}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventsContainer}>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(renderEventItem)
          ) : (
            <Text style={styles.noDataText}>Events Coming Soon!</Text>
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
          <TouchableOpacity onPress={() => navigation.navigate("Events", { filterType: "workshop", showAll: true })}>
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
  eventDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  optionsButton: {
    padding: 5,
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
    justifyContent: "space-between",
    marginBottom: 10,
  },
  workshopTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
    flex: 1,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDetailsModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    padding: 15,
  },
  eventDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    paddingRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  eventDetailsScrollView: {
    padding: 15,
  },
  eventDetailSection: {
    marginBottom: 20,
  },
  eventDetailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  eventDetailLink: {
    fontSize: 14,
    color: '#0066cc',
    marginTop: 5,
  },
});

export default HomeScreen;
