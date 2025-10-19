import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { updateHelpRequest, uploadEvidenceFile } from '../../lib/beneficiary';

const SRI_LANKAN_PROVINCES = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province',
];

export default function EditHelpRequestScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse location from params
  const parseLocation = () => {
    const locationStr = (params.location as string) || '';
    const parts = locationStr.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      return {
        address: parts[0] || '',
        city: parts[1] || '',
        province: parts[2] || '',
      };
    }
    return {
      address: '',
      city: '',
      province: '',
    };
  };

  const locationData = parseLocation();

  // Parse items needed once during initialization
  const parseItemsNeeded = () => {
    if (params.itemsNeeded) {
      try {
        const items = JSON.parse(params.itemsNeeded as string);
        return Array.isArray(items) ? items.join(', ') : '';
      } catch {
        return '';
      }
    }
    return '';
  };

  // Parse payment details to extract bank info if it exists
  const parsePaymentDetails = () => {
    const paymentDetailsStr = (params.paymentDetails as string) || '';
    const bankMatch = paymentDetailsStr.match(/Bank:\s*(.+)/);
    const accountMatch = paymentDetailsStr.match(/Account Number:\s*(.+)/);
    const holderMatch = paymentDetailsStr.match(/Account Holder:\s*(.+)/);
    const branchMatch = paymentDetailsStr.match(/Branch Code:\s*(.+)/);

    return {
      isBankDetails: !!bankMatch,
      bankName: bankMatch ? bankMatch[1].trim() : '',
      accountNumber: accountMatch ? accountMatch[1].trim().split('\n')[0] : '',
      accountHolderName: holderMatch ? holderMatch[1].trim().split('\n')[0] : '',
      branchCode: branchMatch ? branchMatch[1].trim() : '',
      rawDetails: paymentDetailsStr,
    };
  };

  const paymentInfo = parsePaymentDetails();

  // Initialize state with values from params
  const [fullName, setFullName] = useState((params.fullName as string) || '');
  const [age, setAge] = useState((params.age as string) || '');
  const [province, setProvince] = useState(locationData.province);
  const [city, setCity] = useState(locationData.city);
  const [address, setAddress] = useState(locationData.address);
  const [typeOfHelp, setTypeOfHelp] = useState((params.typeOfHelp as string) || '');
  const [description, setDescription] = useState((params.description as string) || '');
  const [requestedAmount, setRequestedAmount] = useState((params.requestedAmount as string) || '');
  const [paymentDetails, setPaymentDetails] = useState(paymentInfo.isBankDetails ? '' : paymentInfo.rawDetails);
  const [urgency, setUrgency] = useState((params.urgency as string) || 'Medium');
  const [itemsNeeded, setItemsNeeded] = useState(parseItemsNeeded());
  const [file, setFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Payment detail fields
  const [bankName, setBankName] = useState(paymentInfo.bankName);
  const [accountNumber, setAccountNumber] = useState(paymentInfo.accountNumber);
  const [accountHolderName, setAccountHolderName] = useState(paymentInfo.accountHolderName);
  const [branchCode, setBranchCode] = useState(paymentInfo.branchCode);

  // Validation errors
  const [errors, setErrors] = useState<any>({});

  const isFinancialAid = typeOfHelp === 'Financial Aid';

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

  const validateForm = () => {
    const newErrors: any = {};

    // Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }

    // Age validation
    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      newErrors.age = 'Please enter a valid age (1-120)';
    }

    // Location validation
    if (!province) {
      newErrors.province = 'Province is required';
    }
    if (!city.trim()) {
      newErrors.city = 'City is required';
    } else if (city.trim().length < 2) {
      newErrors.city = 'City name must be at least 2 characters';
    }
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    } else if (address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    // Type of help validation
    if (!typeOfHelp) {
      newErrors.typeOfHelp = 'Please select type of help';
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    // Items needed validation (only for non-financial aid)
    if (!isFinancialAid && !itemsNeeded.trim()) {
      newErrors.itemsNeeded = 'Please specify items needed';
    }

    // Amount validation
    if (!requestedAmount.trim()) {
      newErrors.requestedAmount = 'Requested amount is required';
    } else if (isNaN(Number(requestedAmount)) || Number(requestedAmount) <= 0) {
      newErrors.requestedAmount = 'Please enter a valid amount greater than 0';
    } else if (Number(requestedAmount) > 10000000) {
      newErrors.requestedAmount = 'Amount cannot exceed 10,000,000 LKR';
    }

    // Payment details validation
    if (isFinancialAid) {
      if (!bankName.trim()) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required';
      } else if (!/^\d+$/.test(accountNumber)) {
        newErrors.accountNumber = 'Account number must contain only digits';
      }
      if (!accountHolderName.trim()) {
        newErrors.accountHolderName = 'Account holder name is required';
      } else if (accountHolderName.trim().length < 3) {
        newErrors.accountHolderName = 'Account holder name must be at least 3 characters';
      }
    } else {
      if (!paymentDetails.trim()) {
        newErrors.paymentDetails = 'Payment details are required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix all errors before updating');
      return;
    }

    setIsUploading(true);

    try {
      let evidenceFileIds = (params.evidenceFileIds as string) || '';

      // Upload new file if selected
      if (file) {
        try {
          const newFileId = await uploadEvidenceFile(file);
          console.log('File uploaded successfully with ID:', newFileId);
          
          // Combine old and new file IDs
          const existingIds = evidenceFileIds ? evidenceFileIds.split(',') : [];
          evidenceFileIds = [...existingIds, newFileId].join(',');
        } catch (fileError) {
          console.error('File upload error:', fileError);
          Alert.alert('Warning', 'File upload failed, but continuing with request update');
        }
      }

      // Construct location string
      const location = `${address}, ${city}, ${province}`;

      // Parse items needed
      const itemsArray = isFinancialAid ? [] : itemsNeeded
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      // Construct payment details
      let paymentDetailsString = paymentDetails;
      if (isFinancialAid) {
        paymentDetailsString = `Bank: ${bankName}\nAccount Number: ${accountNumber}\nAccount Holder: ${accountHolderName}${branchCode ? `\nBranch Code: ${branchCode}` : ''}`;
      }

      // Update help request
      await updateHelpRequest(params.requestId as string, {
        fullName,
        age: parseInt(age),
        location,
        typeOfHelp,
        description,
        requestedAmount: parseFloat(requestedAmount),
        paymentDetails: paymentDetailsString,
        urgency,
        itemsNeeded: itemsArray,
        evidenceFileIds,
      });

      Alert.alert('Success', 'Help request updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error updating request:', error);
      Alert.alert('Error', 'Failed to update help request. Please try again.');
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Help Request</Text>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>ℹ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.mainContent} 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="Enter your full name"
              placeholderTextColor="#6B7280"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors({ ...errors, fullName: null });
              }}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          {/* Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              placeholder="Enter your age"
              placeholderTextColor="#6B7280"
              value={age}
              onChangeText={(text) => {
                setAge(text);
                if (errors.age) setErrors({ ...errors, age: null });
              }}
              keyboardType="numeric"
            />
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
          </View>

          {/* Province */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Province *</Text>
            <View style={[styles.pickerContainer, errors.province && styles.inputError]}>
              <Picker
                selectedValue={province}
                onValueChange={(itemValue) => {
                  setProvince(itemValue);
                  if (errors.province) setErrors({ ...errors, province: null });
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Province" value="" />
                {SRI_LANKAN_PROVINCES.map((prov) => (
                  <Picker.Item key={prov} label={prov} value={prov} />
                ))}
              </Picker>
            </View>
            {errors.province && <Text style={styles.errorText}>{errors.province}</Text>}
          </View>

          {/* City */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="Enter your city"
              placeholderTextColor="#6B7280"
              value={city}
              onChangeText={(text) => {
                setCity(text);
                if (errors.city) setErrors({ ...errors, city: null });
              }}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              placeholder="Enter your street address"
              placeholderTextColor="#6B7280"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) setErrors({ ...errors, address: null });
              }}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* Request Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Request Type *</Text>
            <View style={[styles.pickerContainer, errors.typeOfHelp && styles.inputError]}>
              <Picker
                selectedValue={typeOfHelp}
                onValueChange={(itemValue) => {
                  setTypeOfHelp(itemValue);
                  if (errors.typeOfHelp) setErrors({ ...errors, typeOfHelp: null });
                }}
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
            {errors.typeOfHelp && <Text style={styles.errorText}>{errors.typeOfHelp}</Text>}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe your request in detail (minimum 20 characters)"
              placeholderTextColor="#6B7280"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) setErrors({ ...errors, description: null });
              }}
              multiline
              numberOfLines={4}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Items Needed - Only show if NOT Financial Aid */}
          {!isFinancialAid && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Items Needed *</Text>
              <TextInput
                style={[styles.input, errors.itemsNeeded && styles.inputError]}
                placeholder="e.g., Rice, Milk, Diapers (separate with commas)"
                placeholderTextColor="#6B7280"
                value={itemsNeeded}
                onChangeText={(text) => {
                  setItemsNeeded(text);
                  if (errors.itemsNeeded) setErrors({ ...errors, itemsNeeded: null });
                }}
              />
              {errors.itemsNeeded && <Text style={styles.errorText}>{errors.itemsNeeded}</Text>}
            </View>
          )}

          {/* Requested Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Requested Amount (LKR) *</Text>
            <TextInput
              style={[styles.input, errors.requestedAmount && styles.inputError]}
              placeholder="Enter amount"
              placeholderTextColor="#6B7280"
              value={requestedAmount}
              onChangeText={(text) => {
                setRequestedAmount(text);
                if (errors.requestedAmount) setErrors({ ...errors, requestedAmount: null });
              }}
              keyboardType="numeric"
            />
            {errors.requestedAmount && <Text style={styles.errorText}>{errors.requestedAmount}</Text>}
          </View>

          {/* Payment Details - Show bank fields for Financial Aid, otherwise simple text */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Details *</Text>
            {isFinancialAid ? (
              <>
                <TextInput
                  style={[styles.input, errors.bankName && styles.inputError]}
                  placeholder="Bank Name (e.g., Bank of Ceylon)"
                  placeholderTextColor="#6B7280"
                  value={bankName}
                  onChangeText={(text) => {
                    setBankName(text);
                    if (errors.bankName) setErrors({ ...errors, bankName: null });
                  }}
                />
                {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
                
                <View style={{ height: 12 }} />
                <TextInput
                  style={[styles.input, errors.accountNumber && styles.inputError]}
                  placeholder="Account Number"
                  placeholderTextColor="#6B7280"
                  value={accountNumber}
                  onChangeText={(text) => {
                    setAccountNumber(text);
                    if (errors.accountNumber) setErrors({ ...errors, accountNumber: null });
                  }}
                  keyboardType="numeric"
                />
                {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
                
                <View style={{ height: 12 }} />
                <TextInput
                  style={[styles.input, errors.accountHolderName && styles.inputError]}
                  placeholder="Account Holder Name"
                  placeholderTextColor="#6B7280"
                  value={accountHolderName}
                  onChangeText={(text) => {
                    setAccountHolderName(text);
                    if (errors.accountHolderName) setErrors({ ...errors, accountHolderName: null });
                  }}
                />
                {errors.accountHolderName && <Text style={styles.errorText}>{errors.accountHolderName}</Text>}
                
                <View style={{ height: 12 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Branch Code (Optional)"
                  placeholderTextColor="#6B7280"
                  value={branchCode}
                  onChangeText={setBranchCode}
                />
              </>
            ) : (
              <>
                <TextInput
                  style={[styles.input, errors.paymentDetails && styles.inputError]}
                  placeholder="e.g., Bank Account, Mobile Wallet"
                  placeholderTextColor="#6B7280"
                  value={paymentDetails}
                  onChangeText={(text) => {
                    setPaymentDetails(text);
                    if (errors.paymentDetails) setErrors({ ...errors, paymentDetails: null });
                  }}
                />
                {errors.paymentDetails && <Text style={styles.errorText}>{errors.paymentDetails}</Text>}
              </>
            )}
          </View>

          {/* Urgency */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Urgency *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={urgency}
                onValueChange={(itemValue) => setUrgency(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="High" value="High" />
                <Picker.Item label="Urgent" value="Urgent" />
              </Picker>
            </View>
          </View>

          {/* File Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload New File (Optional)</Text>
            <Text style={styles.helperText}>
              Add new supporting evidence or documents. Existing files will be kept.
            </Text>
            <TouchableOpacity
              onPress={pickFile}
              style={styles.uploadBox}
              disabled={isUploading}
            >
              <Text style={styles.uploadIcon}>☁️</Text>
              <Text style={styles.uploadText}>
                <Text style={styles.uploadTextBold}>Click to upload</Text> or drag and drop
              </Text>
              <Text style={styles.uploadSubtext}>PDF, PNG, JPG or DOCX</Text>
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
              {isUploading ? 'Updating...' : 'Update Help Request'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
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