// UpdateProfile.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const UpdateProfile = ({ route, navigation }) => {
  const { email, student } = route.params || {};

  if (!student) {
    Alert.alert('Error', 'Student data is not available.');
    navigation.goBack();
    return null;
  }

  const [studName, setStudName] = useState(student.studName || '');
  const [studId, setStudId] = useState(student.studId || '');
  const [department, setDepartment] = useState(student.department || '');
  const [course, setCourse] = useState(student.course || '');
  const [loading, setLoading] = useState(false);

  const coursesByDepartment = {
  "CCMS": [
      "Bachelor of Science in Computer Science",
      "Bachelor of Science in Information Technology",
      "Bachelor of Science in Entertainment and Multimedia Computing"
  ],
  "CHITM": [
      "Bachelor of Science in Tourism Management",
      "Bachelor of Science in Hospitality Management"
  ],
  "CNAHS": [
      "Bachelor of Science in Nursing",
      "Bachelor of Science in Medical Technology"
  ],
  "CENG": [
      "Bachelor of Science in Civil Engineering",
      "Bachelor of Science in Computer Engineering",
      "Bachelor of Science in Electric Engineering",
      "Bachelor of Science in Electronics Engineering",
      "Bachelor of Science in Geodetic Engineering",
      "Bachelor of Science in Industrial Engineering",
      "Bachelor of Science in Mechanical Engineering"
  ],
  "CAFA": [
      "Bachelor of Science in Architecture",
      "Bachelor of Fine Arts"
  ],
  "CAS": [
      "Bachelor of Arts in Communication",
      "Bachelor of Science in Psychology",
      "Bachelor of Arts in Political Science",
      "Bachelor of Arts in English Language",
      "Bachelor of Science in Biology",
      "Bachelor of Science in Economics",
      "Bachelor of Science in Environmental Sciences",
      "Bachelor of Science in Public Administration"
  ],
  "CCJC": ["Bachelor of Science in Criminology"],
  "CME": [
      "Bachelor of Science in Marine Engineering",
      "Bachelor of Science in Marine Transportation"
  ],
  "CBA": [
      "Bachelor of Science in Accountancy",
      "Bachelor of Science in (BA-MM)",
      "Bachelor of Science in (BA-HRM)",
      "Bachelor of Science in (BA-FM)",
      "Bachelor of Science in (BA-OM)",
      "Bachelor of Science in Management Accounting"
  ]
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.18.4:5000/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, studName, studId, department, course }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Profile Updated', data.message);
        navigation.navigate('Home', { student: { studName, email, studId, department, course } });
      } else {
        Alert.alert('Update Failed', data.message);
      }
      
    } catch (error) {
      Alert.alert('Update Failed', 'An error occurred. Please try again later.');
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    setStudName(student.studName || '');
    setStudId(student.studId || '');
    setDepartment(student.department || '');
    setCourse(student.course || '');
  }, [student]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        editable={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Student Name"
        value={studName}
        onChangeText={setStudName}
      />
      <TextInput
        style={styles.input}
        placeholder="Student ID"
        value={studId}
        onChangeText={setStudId}
      />
      
      <Text style={styles.label}>Department</Text>
      <Picker
        selectedValue={department || ""}
        onValueChange={(itemValue) => {
          setDepartment(itemValue);
          setCourse('');  // Reset course when department changes
        }}
        style={styles.picker}
      >
        <Picker.Item label="Select Department" value="" />
        {Object.keys(coursesByDepartment).map((dept) => (
          <Picker.Item key={dept} label={dept} value={dept} />
        ))}
      </Picker>
      
      <Text style={styles.label}>Course</Text>
      <Picker
        selectedValue={course || ""}
        onValueChange={(itemValue) => setCourse(itemValue)}
        style={styles.picker}
        enabled={department !== ''}
      >
        <Picker.Item label="Select Course" value="" />
        {department && coursesByDepartment[department]?.map((courseName) => (
          <Picker.Item key={courseName} label={courseName} value={courseName} />
        ))}
      </Picker>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleUpdateProfile}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Profile'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  title: {
    fontSize: 28,
    color: '#800000', // Maroon
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#800000', // Maroon border
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    borderColor: '#800000',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#800000', // Maroon
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: '#333', // Darker color for Home button
  },
  buttonText: {
    color: '#fff', // White text
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#800000a0', // Semi-transparent maroon for loading state
  },
});

export default UpdateProfile;
