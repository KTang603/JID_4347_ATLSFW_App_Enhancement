import React, { useState, useMemo, useCallback } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import { fetchHomeData } from "../redux/actions/homeAction";

// Extracted Modal Component
const EventDetailsModal = ({ visible, event, onClose }) => {
  if (!event) return null;
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.eventDetailsModalContent}>
          <View style={styles.eventDetailsHeader}>
            <Text style={styles.eventDetailsTitle}>
              {getEventTitle(event)}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.eventDetailsScrollView}>
            {/* Date and Time */}
            <ModalSection 
              label="Date & Time" 
              content={formatEventDateTime(
                event.event_date,
                event.event_time,
                event.event_end_time
              )} 
            />

            {/* Location */}
            <ModalSection 
              label="Location" 
              content={event.event_location || event.location || "No location provided"} 
            />

            {/* Description */}
            {(event.event_desc || event.description) && (
              <ModalSection 
                label="Description" 
                content={event.event_desc || event.description} 
              />
            )}

            {/* Links */}
            {event.event_link && (
              <ModalSection 
                label="Event Link" 
                isLink={true}
                url={event.event_link}
                linkText="Open Event Link"
              />
            )}

            {/* Ticket URL if available */}
            {event.ticket_url && (
              <ModalSection 
                label="Tickets" 
                isLink={true}
                url={event.ticket_url}
                linkText="Get Tickets"
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

  // Modal Section Component
const ModalSection = ({ label, content, isLink = false, url, linkText }) => (
  <View style={styles.eventDetailSection}>
    <Text style={styles.eventDetailLabel}>{label}</Text>
    {isLink ? (
      <TouchableOpacity onPress={() => Linking.openURL(url)}>
        <Text style={styles.eventDetailLink}>{linkText}</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.eventDetailText}>{content}</Text>
    )}
  </View>
);

// Helper functions
const getEventTitle = (event) => 
  event.event_title || event.title || "Untitled Event";

const getEventDescription = (event) => {
  const desc = event.event_desc || event.description;
  // Check if the description is a URL
  if (desc && (desc.startsWith("http://") || desc.startsWith("https://"))) {
    return "Click for event details";
  }
  return desc;
};

// Date formatters with memoization
const formatTimeCache = {};
const formatTime = (time) => {
  if (!time) return "";
  
  // Use cache to avoid redundant calculations
  if (formatTimeCache[time]) return formatTimeCache[time];
  
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM

  // If minutes is "00", only show the hour
  const result = minutes === "00" ? `${hour12}${ampm}` : `${hour12}:${minutes}${ampm}`;
  formatTimeCache[time] = result;
  return result;
};

const formatDateTimeCache = {};
const formatEventDateTime = (dateStr, startTime, endTime) => {
  if (!dateStr) return "";
  
  // Create a cache key from the arguments
  const cacheKey = `${dateStr}-${startTime || ""}-${endTime || ""}`;
  
  // Return cached result if available
  if (formatDateTimeCache[cacheKey]) return formatDateTimeCache[cacheKey];
  
  // Parse the date - ensure we're using the correct date by handling timezone issues
  // Format: YYYY-MM-DD (e.g., 2025-03-29)
  const [year, month, day] = dateStr
    .split("-")
    .map((num) => parseInt(num, 10));

  // Create date using UTC to avoid timezone issues (months are 0-indexed in JS)
  const date = new Date(Date.UTC(year, month - 1, day));

  // Get day of week
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = days[date.getUTCDay()];

  // Get month
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
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
  
  // Cache the result
  formatDateTimeCache[cacheKey] = formattedDateTime;
  return formattedDateTime;
};

// Generic Card Component - Optimize with separate render functions by type
const Card = ({ item, type, onPress, optionsPress }) => {
  // Select the appropriate style based on card type
  const cardStyle = {
    event: styles.eventCard,
    brand: styles.brandCard,
    workshop: styles.workshopCard,
  };

  // Use separate render functions by type for clarity and performance
  if (type === 'event') {
    return (
      <TouchableOpacity 
        key={item._id} 
        style={cardStyle[type]} 
        onPress={() => onPress(item)}
      >
        <View style={styles.eventInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.eventTitle}>{getEventTitle(item)}</Text>
            {optionsPress && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  optionsPress(item);
                }}
                style={styles.optionsButton}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>

          {(item.event_desc || item.description) && (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {getEventDescription(item)}
            </Text>
          )}

          <Text style={[styles.eventDate, { marginTop: 5 }]}>
            {formatEventDateTime(
              item.event_date || item.date,
              item.event_time,
              item.event_end_time
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  if (type === 'brand') {
    return (
      <TouchableOpacity 
        key={item._id} 
        style={cardStyle[type]} 
        onPress={() => onPress(item)}
      >
        <View style={styles.brandImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.brandImage} />
          ) : (
            <View style={[styles.brandImage, styles.placeholderImage]}>
              <Ionicons name="shirt" size={30} color="#02833D" />
            </View>
          )}
        </View>
        <Text style={styles.brandName}>{item.name}</Text>
      </TouchableOpacity>
    );
  }
  
  if (type === 'workshop') {
    return (
      <TouchableOpacity 
        key={item._id} 
        style={cardStyle[type]} 
        onPress={() => onPress(item)}
      >
        <View style={styles.workshopHeader}>
          <Text style={[styles.workshopTitle, { marginLeft: 0 }]}>{getEventTitle(item)}</Text>
          {optionsPress && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                optionsPress(item);
              }}
              style={styles.optionsButton}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        {(item.event_desc || item.description) && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {getEventDescription(item)}
          </Text>
        )}

        <Text style={[styles.workshopDate, { marginTop: 5 }]}>
          {formatEventDateTime(
            item.event_date || item.date,
            item.event_time || item.time,
            item.event_end_time
          )}
        </Text>
      </TouchableOpacity>
    );
  }
  
  return null;
};

// Section Component
const Section = ({ title, onSeeAll, children, noDataMessage }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
    {children || <Text style={styles.noDataText}>{noDataMessage}</Text>}
  </View>
);

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector((store) => store.userInfo.token);
  const {
    upcomingEvents,
    featuredBrands,
    workshops,
    featuredTicketEvent,
    loading,
  } = useSelector((store) => store.home);

  // Filter events to only show those happening today or in the future
  const filterCurrentAndFutureEvents = useCallback((events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day
    
    return events.filter(event => {
      if (!event.event_date && !event.date) return false;
      
      const dateStr = event.event_date || event.date;
      const [year, month, day] = dateStr.split("-").map(num => parseInt(num, 10));
      const eventDate = new Date(year, month - 1, day);
      eventDate.setHours(0, 0, 0, 0); // Set to beginning of day
      
      return eventDate >= today;
    }).sort((a, b) => {
      // Sort by date (ascending)
      const dateA = a.event_date || a.date;
      const dateB = b.event_date || b.date;
      
      return new Date(dateA) - new Date(dateB);
    }).slice(0, 2); // Take only the first 2 upcoming events
  }, []);
  
  // Get random brands
  const getRandomBrands = useCallback((brands, count = 2) => {
    if (brands.length <= count) return brands;
    
    const shuffled = [...brands].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, []);
  
  // Memoize filtered lists to prevent recalculation on every render
  const filteredEvents = useMemo(() => 
    filterCurrentAndFutureEvents(upcomingEvents),
  [upcomingEvents, filterCurrentAndFutureEvents]);
  
  const filteredWorkshops = useMemo(() => 
    filterCurrentAndFutureEvents(workshops),
  [workshops, filterCurrentAndFutureEvents]);
  
  const randomBrands = useMemo(() => 
    getRandomBrands(featuredBrands),
  [featuredBrands, getRandomBrands]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchHomeData(token));
    setRefreshing(false);
  }, [dispatch, token]);
  
  const showEventDetails = useCallback((event) => {
    setSelectedEvent(event);
    setEventDetailsVisible(true);
  }, []);

  // Loading State
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
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#02833D"]}
        />
      }
    >
      {/* Event Details Modal */}
      <EventDetailsModal 
        visible={eventDetailsVisible}
        event={selectedEvent}
        onClose={() => setEventDetailsVisible(false)}
      />

      {/* Upcoming Events Section */}
      <Section 
        title="Upcoming Events"
        onSeeAll={() => navigation.navigate("Events", { eventType: "regular" })}
        noDataMessage="Events Coming Soon!"
      >
        {filteredEvents.length > 0 && (
          <View style={styles.eventsContainer}>
            {filteredEvents.map(event => (
              <Card 
                key={event._id}
                item={event} 
                type="event" 
                onPress={showEventDetails}
                optionsPress={showEventDetails}
              />
            ))}
          </View>
        )}
      </Section>

      {/* Ticket Information */}
      <Section title="Get Your Tickets">
        {featuredTicketEvent ? (
          <TouchableOpacity
            style={styles.ticketCard}
            onPress={() => showEventDetails(featuredTicketEvent)}
          >
            <View style={styles.ticketContent}>
              <View style={styles.titleRow}>
                <Text style={styles.ticketTitle}>
                  {featuredTicketEvent.event_title}
                </Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    showEventDetails(featuredTicketEvent);
                  }}
                  style={styles.optionsButton}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#aaa" />
                </TouchableOpacity>
              </View>
              <Text style={styles.ticketDescription}>
                {featuredTicketEvent.event_desc &&
                featuredTicketEvent.event_desc.length > 100
                  ? `${featuredTicketEvent.event_desc.substring(0, 100)}...`
                  : featuredTicketEvent.event_desc ||
                    "Secure your spot at this event. Tickets available now!"}
              </Text>
              <Text style={[styles.eventDate, { marginTop: 5, marginBottom: 10 }]}>
                {formatEventDateTime(
                  featuredTicketEvent.event_date || featuredTicketEvent.date,
                  featuredTicketEvent.event_time,
                  featuredTicketEvent.event_end_time
                )}
              </Text>
              <TouchableOpacity 
                style={styles.ticketButton}
                onPress={(e) => {
                  e.stopPropagation();
                  if (featuredTicketEvent.ticket_url) {
                    Linking.openURL(featuredTicketEvent.ticket_url);
                  }
                }}
              >
                <Text style={styles.ticketButtonText}>Purchase Tickets</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.ticketCard}>
            <View style={styles.ticketContent}>
              <Text style={styles.ticketTitle}>Events Coming Soon</Text>
              <Text style={styles.ticketDescription}>
                Check back later for upcoming events and ticket information.
              </Text>
            </View>
          </View>
        )}
      </Section>

      {/* Participating Brands */}
      <Section 
        title="Participating Brands"
        onSeeAll={() => navigation.navigate("Shop")}
        noDataMessage="Brands coming soon"
      >
        {randomBrands.length > 0 && (
          <View style={styles.brandsContainer}>
            {randomBrands.map(brand => (
              <Card 
                key={brand._id}
                item={brand} 
                type="brand" 
                onPress={() => navigation.navigate("Shop Now Webview", { vendorId: brand._id })}
              />
            ))}
          </View>
        )}
      </Section>

      {/* Workshops & Repair Cafe */}
      <Section 
        title="Workshops & Repair Cafe"
        onSeeAll={() => navigation.navigate("Events", { eventType: "workshop" })}
        noDataMessage="No workshops scheduled at this time"
      >
        {filteredWorkshops.length > 0 && (
          <View style={styles.workshopsContainer}>
            {filteredWorkshops.map(workshop => (
              <Card 
                key={workshop._id}
                item={workshop} 
                type="workshop" 
                onPress={showEventDetails}
                optionsPress={showEventDetails}
              />
            ))}
          </View>
        )}
      </Section>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  eventDetailsModalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    padding: 15,
  },
  eventDetailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
    fontWeight: "bold",
    color: "#666",
    marginBottom: 5,
  },
  eventDetailText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  eventDetailLink: {
    fontSize: 14,
    color: "#0066cc",
    marginTop: 5,
  },
});

export default HomeScreen;
