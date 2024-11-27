import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState(null);

  useEffect(() => {
    if (loginData) {
      const { studName, studId, department, course } = loginData;
      
      if (!studName || !studId || !department || !course) {
        Alert.alert('Profile Incomplete', 'Please complete your profile before logging in.');
        navigation.navigate('UpdateProfile', { studentData: loginData });
      } else {
        Alert.alert('Login Successful', `Welcome ${email}!`);
        login(loginData);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home', params: { student: loginData } }],
          })
        );
      }
    }
  }, [loginData, navigation, email, login]);

  const handleLogin = async () => {
    setLoading(true); // Show loading indicator
    if (email && password) {
      try {
        const loginResponse = await fetch('http://192.168.18.4:5000/api/student/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
  
        const loginData = await loginResponse.json();
        console.log('Login Data:', loginData); // Log the entire response
  
        if (loginResponse.ok) {
          Alert.alert('Login Successful', `Welcome ${email}!`);
  
          // Check if the required profile info is present
          if (
            loginData.studId && // Ensure studId is included
            loginData.studName && // Ensure studName is included
            loginData.department && // Ensure department is included
            loginData.course // Ensure course is included
          ) {
            // If the user has profile info, navigate to Home
            navigation.navigate('Home', { student: loginData });
          } else {
            // If profile info is missing, navigate to UpdateProfile
            Alert.alert('Profile Incomplete', 'Please complete your profile.');
            navigation.navigate('UpdateProfile', { email: email, student: loginData });
          }
        } else {
          Alert.alert('Login Failed', loginData.message);
        }
      } catch (error) {
        console.error('Error during login:', error); // Log the error
        Alert.alert('Login Failed', 'An error occurred. Please try again later.');
      }
    } else {
      Alert.alert('Login Failed', 'Please fill all fields.');
    }
    setLoading(false); // Hide loading indicator
  };
  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRegister}>
        <Text style={styles.registerText}>
          Don't have an account? <Text style={styles.registerLink}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#800000', // Maroon color
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#800000',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#800000', // Maroon color
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
    fontSize: 16,
  },
  registerLink: {
    color: '#800000', // Maroon color
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
