import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
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
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true, // Important for file access
      });

     

      // Check if user cancelled
      if (result.canceled) {
        console.log('User cancelled document picker');
        return;
      }

      // Check if we have assets (newer expo-document-picker format)
      if (result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        console.log('Selected file:', selectedFile);
        setFile(selectedFile);
      } else if ('uri' in result) {
        // Fallback for older format
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
        console.log('Uploading file:', file);
        try {
          evidenceFileId = await uploadEvidenceFile(file);
          console.log('File uploaded successfully with ID:', evidenceFileId);
        } catch (fileError) {
          console.error('File upload error:', fileError);
          Alert.alert('Warning', 'File upload failed, but continuing with request submission');
          // Continue without file instead of failing completely
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
        <TextInput
          className="border border-gray-300 rounded p-3 mt-2"
          placeholder="Type of Help"
          value={typeOfHelp}
          onChangeText={setTypeOfHelp}
        />
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

        <Text className="text-lg font-semibold mt-6">Urgency</Text>
        <TextInput
          className="border border-gray-300 rounded p-3 mt-2"
          placeholder="Urgency (Low, Medium, High, Critical)"
          value={urgency}
          onChangeText={setUrgency}
        />

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