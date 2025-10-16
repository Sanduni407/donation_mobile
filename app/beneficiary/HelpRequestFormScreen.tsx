import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { createHelpRequest, HelpRequestData, uploadEvidenceFile } from '../../lib/beneficiary';

const HelpRequestFormScreen = () => {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.name || '');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [typeOfHelp, setTypeOfHelp] = useState('');
  const [description, setDescription] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [urgency, setUrgency] = useState('Low');
  const [itemsNeeded, setItemsNeeded] = useState('');
  const [file, setFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('User cancelled document picker');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        console.log('Selected file:', selectedFile);
        setFile(selectedFile);
      } else if ('uri' in result) {
        console.log('Selected file (old format):', result);
        setFile(result);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !age || !location || !typeOfHelp || !description || !requestedAmount || !urgency) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setIsUploading(true);

    try {
      let evidenceFileId: string | undefined;

      if (file) {
        try {
          evidenceFileId = await uploadEvidenceFile(file);
          console.log('File uploaded successfully with ID:', evidenceFileId);
        } catch (fileError) {
          console.error('File upload error:', fileError);
          Alert.alert('Warning', 'File upload failed, but continuing with request submission');
        }
      }

      const data: HelpRequestData = {
        userId: user.$id,
        beneficiaryRequestCode: `BR-${Date.now()}`,
        fullName,
        age: parseInt(age),
        location,
        typeOfHelp,
        description,
        requestedAmount: parseFloat(requestedAmount),
        paymentDetails,
        urgency,
        itemsNeeded: itemsNeeded.split(',').map(item => item.trim()),
        evidenceFileIds: evidenceFileId,
        status: 'Pending',
      };

      console.log('Creating help request with data:', data);
      await createHelpRequest(data);

      Alert.alert('Success', 'Help request submitted successfully!');

      // Reset form
      setAge('');
      setLocation('');
      setTypeOfHelp('');
      setDescription('');
      setRequestedAmount('');
      setPaymentDetails('');
      setItemsNeeded('');
      setFile(null);

    } catch (err) {
      console.error('Submission error:', err);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Help Request</Text>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>ℹ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#6B7280"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Age and Location Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                placeholderTextColor="#6B7280"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your location"
                placeholderTextColor="#6B7280"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Request Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Request Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={typeOfHelp}
                onValueChange={(itemValue) => setTypeOfHelp(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select type of help" value="" />
                <Picker.Item label="Financial Aid" value="Financial Aid" />
                <Picker.Item label="Medical Support" value="Medical Support" />
                <Picker.Item label="Food Assistance" value="Food Assistance" />
                <Picker.Item label="Educational Support" value="Educational Support" />
                <Picker.Item label="Housing Support" value="Housing Support" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your request in detail"
              placeholderTextColor="#6B7280"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Items Needed */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Items Needed</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Rice, Milk, Diapers"
              placeholderTextColor="#6B7280"
              value={itemsNeeded}
              onChangeText={setItemsNeeded}
            />
          </View>

          {/* Requested Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Requested Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#6B7280"
              value={requestedAmount}
              onChangeText={setRequestedAmount}
              keyboardType="numeric"
            />
          </View>

          {/* Payment Details */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Details</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bank Account, Mobile Wallet"
              placeholderTextColor="#6B7280"
              value={paymentDetails}
              onChangeText={setPaymentDetails}
            />
          </View>

          {/* Urgency */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Urgency</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={urgency}
                onValueChange={(itemValue) => setUrgency(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="High" value="High" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Urgent" value="Urgent" />
              </Picker>
            </View>
          </View>

          {/* File Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>File Upload</Text>
            <Text style={styles.helperText}>Upload supporting evidence or documents. You can update this later if needed.</Text>
            <TouchableOpacity
              onPress={pickFile}
              style={styles.uploadBox}
              disabled={isUploading}
            >
              <Text style={styles.uploadIcon}>☁️</Text>
              <Text style={styles.uploadText}>
                <Text style={styles.uploadTextBold}>Click to upload</Text> or drag and drop
              </Text>
              <Text style={styles.uploadSubtext}>SVG, PNG, JPG or GIF (MAX. 800x400px)</Text>
            </TouchableOpacity>
            {file && (
              <Text style={styles.fileSelectedText}>
                Selected: {file.name || 'Unknown file'}
              </Text>
            )}
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.primaryButton, isUploading && styles.disabledButton]}
            disabled={isUploading}
          >
            <Text style={styles.primaryButtonText}>
              {isUploading ? 'Submitting...' : 'Submit Help Request'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header
  header: {
    backgroundColor: '#007DBD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  headerIcon: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Main Content
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  // Input Groups
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0d1c18',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    color: '#0d1c18',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Row Layout
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  // Picker
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
  },
  picker: {
    color: '#0d1c18',
  },
  // File Upload
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  uploadTextBold: {
    fontWeight: '600',
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  fileSelectedText: {
    marginTop: 8,
    fontSize: 14,
    color: '#0d1c18',
  },
  // Buttons
  buttonContainer: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#00B27A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});

export default HelpRequestFormScreen;