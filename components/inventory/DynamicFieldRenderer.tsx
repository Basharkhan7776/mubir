import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SchemaField } from '@/lib/types';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '@/components/ui/button';

interface DynamicFieldRendererProps {
  field: SchemaField;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicFieldRenderer({ field, value, onChange }: DynamicFieldRendererProps) {
  const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.label}
            value={value?.toString() || ''}
            onChangeText={onChange}
          />
        );

      case 'number':
        return (
          <Input
            placeholder={field.label}
            value={value?.toString() || ''}
            onChangeText={onChange}
            keyboardType="numeric"
          />
        );

      case 'currency':
        return (
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-medium">{currencySymbol}</Text>
            <Input
              placeholder={field.label}
              value={value?.toString() || ''}
              onChangeText={onChange}
              keyboardType="numeric"
              className="flex-1"
            />
          </View>
        );

      case 'date':
        return (
          <View>
            <Button
              variant="outline"
              onPress={() => setShowDatePicker(true)}
              className="justify-start"
            >
              <Text>
                {value ? new Date(value).toLocaleDateString() : `Select ${field.label}`}
              </Text>
            </Button>
            {showDatePicker && (
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    onChange(selectedDate.toISOString().split('T')[0]);
                  }
                }}
              />
            )}
          </View>
        );

      case 'select':
        return (
          <Select
            value={{ value: value || '', label: value || '' }}
            onValueChange={(option) => onChange(option?.value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {field.options?.map((option) => (
                  <SelectItem key={option} label={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        );

      case 'boolean':
        return (
          <View className="flex-row items-center justify-between">
            <Text className="text-base">{field.label}</Text>
            <Switch
              checked={value === true || value === 'true'}
              onCheckedChange={onChange}
            />
          </View>
        );

      default:
        return (
          <Input
            placeholder={field.label}
            value={value?.toString() || ''}
            onChangeText={onChange}
          />
        );
    }
  };

  return (
    <View className="gap-2">
      {field.type !== 'boolean' && (
        <Text className="text-sm font-medium">
          {field.label}
          {field.required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}
      {renderField()}
    </View>
  );
}
