import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const Home = ({ route, navigation }) => {
  const { student = {} } = route.params || {};

  useEffect(() => {
    // Remove back button from Home screen
    navigation.setOptions({
      headerLeft: null, // This removes the back button
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {student.studName}!</Text>
      <Text style={styles.studentInfo}>Email: {student.email}</Text>
      <Text style={styles.studentInfo}>Student ID: {student.studId}</Text>
      <Text style={styles.studentInfo}>Department: {student.department}</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Appointment', { studId: student.studId, studName: student.studName })}
      >
        <Text style={styles.buttonText}>Book Appointment</Text>
      </TouchableOpacity>

      {/* New button to navigate to the Appointment History page */}
      <TouchableOpacity 
        style={[styles.button, styles.historyButton]} 
        onPress={() => navigation.navigate('AppointmentHistory', { studId: student.studId })}
      >
        <Text style={styles.buttonText}>View Appointment History</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} 
        onPress={() => {
          // Perform any logout actions needed here
          navigation.navigate('Login');
        }}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#F9F9F9',
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center', 
    color: '#8B0000',
  },
  studentInfo: { 
    fontSize: 18, 
    marginBottom: 15, 
    textAlign: 'center', 
    color: '#333333',
  },
  button: {
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  historyButton: {
    backgroundColor: '#228B22',  // A different color for the History button
  },
  logoutButton: {
    backgroundColor: '#B22222',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Home;
