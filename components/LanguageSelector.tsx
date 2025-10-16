import { useLanguage } from '@/context/LanguageContext';
import { languageOptions } from '@/lib/translationService';
import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const currentLanguage = languageOptions.find(opt => opt.code === language);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setDropdownVisible(true)}
        className="flex-row items-center px-3 py-2 rounded-lg"
        style={{ backgroundColor: '#E0EEF7' }}
      >
        <Text className="text-sm font-semibold" style={{ color: '#007DBD' }}>
          {currentLanguage?.flag} {currentLanguage?.label}
        </Text>
        <ChevronDown size={16} color="#007DBD" style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
          className="flex-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <View
            className="absolute right-4 top-24 bg-white rounded-lg shadow-lg p-2"
            style={{ minWidth: 180 }}
          >
            {languageOptions.map(option => (
              <TouchableOpacity
                key={option.code}
                onPress={() => {
                  setLanguage(option.code);
                  setDropdownVisible(false);
                }}
                className="flex-row items-center px-4 py-3 rounded-lg mb-1"
                style={{
                  backgroundColor: language === option.code ? '#E0EEF7' : 'transparent'
                }}
              >
                <Text className="text-lg mr-3">{option.flag}</Text>
                <Text
                  className="font-semibold flex-1"
                  style={{
                    color: language === option.code ? '#007DBD' : '#000000'
                  }}
                >
                  {option.label}
                </Text>
                {language === option.code && (
                  <Text style={{ color: '#007DBD' }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};