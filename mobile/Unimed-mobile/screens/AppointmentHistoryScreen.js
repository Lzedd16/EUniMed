import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';

const AppointmentHistoryScreen = ({ route }) => {
  const { studId } = route.params;  // Access studId from route.params
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch appointment history when studId changes
    if (studId) {
      fetchAppointmentHistory();
    }
  }, [studId]);

  const fetchAppointmentHistory = async () => {
    setLoading(true);
    setError('');

    try {
      console.log(`Fetching appointment history for studId: ${studId}`);

      const response = await fetch(`http://192.168.18.4:5000/api/admin/appointments/${studId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointment history:', error);
      setError('Could not fetch appointment history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderAppointmentItem = ({ item }) => {
    const appointmentDate = new Date(item.date);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(appointmentDate);

    return (
      <View style={styles.appointmentItem}>
        <Text style={styles.appointmentText}>Date: {formattedDate}</Text>
        <Text style={styles.appointmentText}>Time Slot: {item.timeSlot}</Text>
        <Text style={styles.appointmentText}>{item.status}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#800000" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : appointments.length === 0 ? (
        <Text style={styles.noAppointmentsText}>No appointments found.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderAppointmentItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 20,
    textAlign: 'center',
  },
  appointmentItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    borderRadius: 8,
  },
  appointmentText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default AppointmentHistoryScreen;
