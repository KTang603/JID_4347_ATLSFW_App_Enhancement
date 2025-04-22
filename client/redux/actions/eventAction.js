import { Alert } from "react-native";
import {
  ADD_PARTICIPANT,
  EVENT_LIST_API,
  PARTICIPANT_LISTS,
} from "../../utils/ApiUtils";
import axios from "axios";
import { handleApiError } from "../../utils/ApiErrorHandler";

export const addParticipantRequest = async (request) => {
  try {
    const { token, eventId, userId } = request;
    const response = await axios.post(
      ADD_PARTICIPANT,
      {
        user_id: userId,
        event_id: eventId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error in fetchEvents:", error);
    Alert.alert("Error", "Failed to load events");
  }
};

export const getAllEvent = async ({ token,navigation }) => {
  try {
    const response = await axios.get(EVENT_LIST_API, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    const errorHandled = handleApiError(error, navigation);
    // Return a default response with empty events array if the error was handled
    if (errorHandled) {
      return { data: { event: [] } };
    }
    // Otherwise, alert the user about the error
    Alert.alert("Error", "Failed to load events");
    return { data: { event: [] } };
  }
};

export const getAllParticipants = async ({ token, eventId, userId }) => {
  try {
    console.log('====================================');
    console.log('token---'+token);
    console.log('====================================');
    const response = await axios.post(
      PARTICIPANT_LISTS,
      {
        user_id: userId,
        event_id: eventId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error in participants:", error);
    Alert.alert("Error", "Failed to load participants");
  }
};
