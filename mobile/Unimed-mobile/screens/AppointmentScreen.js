import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const AppointmentScreen = ({ route }) => {
  const { studId, studName } = route.params;
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]); // Appointments array
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchAvailability();
    fetchAppointments();
  }, [selectedDate]);

  const fetchAvailability = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`http://192.168.18.4:5000/api/admin/availability?date=${formattedDate}`);
      const data = await response.json();
  
      if (response.ok) {
        setAvailability(data); // Update the availability list
      } else {
        Alert.alert('Error', 'Failed to load availability.');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      Alert.alert('Error', 'Failed to load availability.');
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://192.168.18.4:5000/api/admin/appointments/${studId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        // Ensure that appointments are filtered properly, only showing relevant statuses
        setAppointments(data.filter((appointment) => !['booked', 'cancelled', 'done'].includes(appointment.status)));
      } else {
        // Handle case if the response is not an array (e.g., null or object)
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments.');
    }
  };

  const handleBookAppointment = async (timeSlot) => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
  
    // Check if the time slot is available
    const isSlotAvailable = availability.some(item => item.timeSlot === timeSlot && item.isAvailable);
  
    if (!isSlotAvailable) {
      Alert.alert('Error', 'The selected time slot is no longer available.');
      return;
    }
  
    try {
      const response = await fetch('http://192.168.18.4:5000/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studId,
          studName,
          date: selectedDateStr,
          timeSlot,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message);
  
        // After booking, add the new appointment to the state
        setAppointments((prevAppointments) => [
          ...prevAppointments,
          {
            studId,
            studName,
            date: selectedDateStr,
            timeSlot,
            status: 'booked', // New appointment is booked
          },
        ]);
  
        // Refresh the availability list after booking
        fetchAvailability(); // Ensure availability is updated
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Failed to book appointment.');
    }
  };

  const handleDeleteAppointment = async (appointment) => {
    try {
      const response = await fetch('http://192.168.18.4:5000/api/admin/appointments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studId: appointment.studId,
          date: appointment.date,
          timeSlot: appointment.timeSlot,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Alert.alert('Success', data.message);
  
        // After deletion, remove the deleted appointment from the state/UI
        setAppointments((prevAppointments) =>
          prevAppointments.filter((item) => item._id !== appointment._id)
        );
  
        // Refresh the availability after deleting an appointment
        fetchAvailability(); // Ensure availability is refreshed
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      Alert.alert('Error', 'Failed to delete appointment.');
    }
  };
  
  

  const formatDateForDisplay = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    return formattedDate;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Time Slots for {formatDateForDisplay(selectedDate)}</Text>

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>Select Date</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      )}

      <FlatList
        data={availability}
        keyExtractor={(item) => `${item.date}-${item.timeSlot}`}
        renderItem={({ item }) => (
          <View style={styles.slotContainer}>
            <Text style={styles.slotText}>{item.timeSlot}</Text>
            {item.isAvailable ? (
              <View style={styles.availableContainer}>
                <Text style={styles.availableText}>{item.slotsRemaining} slots available</Text>
                <TouchableOpacity style={styles.bookButton} onPress={() => handleBookAppointment(item.timeSlot)}>
                  <Text style={styles.buttonText}>Book</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.fullText}>Fully Booked</Text>
            )}
          </View>
        )}
      />

      <Text style={styles.subTitle}>Your Appointments</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => `${item.date}-${item.timeSlot}-${item._id || item.index}`}
        renderItem={({ item }) => (
          <View style={styles.appointmentContainer}>
            <Text style={styles.appointmentText}>Date: {formatDateForDisplay(new Date(item.date))}</Text>
            <Text style={styles.appointmentText}>Time Slot: {item.timeSlot}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteAppointment(item)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9F9F9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', color: '#8B0000' },
  slotContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderColor: '#ccc' },
  slotText: { fontSize: 18, color: '#333333' },
  availableContainer: { flexDirection: 'row', alignItems: 'center' },
  availableText: { fontSize: 16, color: '#008000', marginRight: 10 },
  fullText: { fontSize: 16, color: 'red' },
  dateButton: { backgroundColor: '#8B0000', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  bookButton: { backgroundColor: '#8B0000', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  subTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  appointmentContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderBottomWidth: 1, 
    borderColor: '#ccc',
    flexWrap: 'wrap',
  },
  appointmentText: { 
    fontSize: 16, 
    color: '#333', 
    flex: 1, 
    flexWrap: 'wrap', 
  },
  deleteButton: { 
    backgroundColor: '#B22222', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 5 
  },
});

export default AppointmentScreen;
