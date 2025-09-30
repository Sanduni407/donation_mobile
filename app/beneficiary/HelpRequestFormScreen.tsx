import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">

        <Text className="text-2xl font-bold text-gray-800 mb-4">Submit Help Request</Text>

        <Text className="text-lg font-semibold mt-4">Personal Info</Text>
        <TextInput
          className="border border-gray-300 rounded p-3 mt-2"
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          className="border border-gray-300 rounded p-3 mt-2"
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        <TextInput
          className="border border-gray-300 rounded p-3 mt-2"
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />

        <Text className="text-lg font-semibold mt-6">Help Details</Text>
        {/* Dropdown for Type of Help */}
        <Text className="mt-2 mb-1 font-medium text-gray-700">Type of Help</Text>
        <View className="border border-gray-300 rounded">
          <Picker
            selectedValue={typeOfHelp}
            onValueChange={(itemValue) => setTypeOfHelp(itemValue)}
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

        <TextInput
          className="border border-gray-300 rounded p-3 mt-2 h-20"
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          className="border border-gray-300 rounded p-3 mt-2"
          placeholder="Requested Amount"
          value={requestedAmount}
          onChangeText={setRequestedAmount}
          keyboardType="numeric"
        />
        <TextInput
          className="border border-gray-300 rounded p-3 mt-2"
          placeholder="Payment Details"
          value={paymentDetails}
          onChangeText={setPaymentDetails}
        />

        {/* Dropdown for Urgency */}
        <Text className="text-lg font-semibold mt-6">Urgency</Text>
        <View className="border border-gray-300 rounded mt-2">
          <Picker
            selectedValue={urgency}
            onValueChange={(itemValue) => setUrgency(itemValue)}
          >
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="High" value="High" />
            <Picker.Item label="Urgent" value="Urgent" />
          </Picker>
        </View>

        <Text className="text-lg font-semibold mt-6">Items Needed (comma separated)</Text>
        <TextInput
          className="border border-gray-300 rounded p-3 mt-2"
          placeholder="item1, item2, ..."
          value={itemsNeeded}
          onChangeText={setItemsNeeded}
        />

        <TouchableOpacity
          onPress={pickFile}
          className="bg-blue-500 p-3 rounded mt-6"
          disabled={isUploading}
        >
          <Text className="text-white text-center">
            {file ? 'Change File' : 'Upload Evidence'}
          </Text>
        </TouchableOpacity>
        {file && (
          <Text className="mt-2 text-gray-700">
            Selected: {file.name || 'Unknown file'}
          </Text>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          className={`p-4 rounded mt-8 mb-8 ${isUploading ? 'bg-gray-400' : 'bg-green-500'}`}
          disabled={isUploading}
        >
          <Text className="text-white text-center font-semibold">
            {isUploading ? 'Submitting...' : 'Submit Help Request'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default HelpRequestFormScreen;
