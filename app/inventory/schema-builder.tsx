import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchemaFieldEditor } from '@/components/schema-builder/SchemaFieldEditor';
import { SchemaField } from '@/lib/types';
import { Plus } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { addCollection } from '@/lib/store/slices/inventorySlice';

export default function SchemaBuilderScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<SchemaField[]>([]);

  const addField = () => {
    const newField: SchemaField = {
      key: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updatedField: SchemaField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const deleteField = (index: number) => {
    Alert.alert(
      'Delete Field',
      'Are you sure you want to delete this field?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newFields = fields.filter((_, i) => i !== index);
            setFields(newFields);
          },
        },
      ]
    );
  };

  const validateAndCreate = () => {
    // Validation
    if (!collectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    if (fields.length === 0) {
      Alert.alert('Error', 'Please add at least one field');
      return;
    }

    // Check for duplicate field keys
    const keys = fields.map((f) => f.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      Alert.alert('Error', 'Field keys must be unique. Please check for duplicates.');
      return;
    }

    // Check that all fields have labels
    const hasEmptyLabels = fields.some((f) => !f.label.trim());
    if (hasEmptyLabels) {
      Alert.alert('Error', 'All fields must have labels');
      return;
    }

    // Check that select fields have options
    const selectFieldsWithoutOptions = fields.filter(
      (f) => f.type === 'select' && (!f.options || f.options.length === 0)
    );
    if (selectFieldsWithoutOptions.length > 0) {
      Alert.alert('Error', 'Dropdown fields must have at least one option');
      return;
    }

    // Create collection
    dispatch(
      addCollection({
        id: Date.now().toString(),
        name: collectionName.trim(),
        description: description.trim() || undefined,
        schema: fields,
        data: [],
      })
    );

    Alert.alert('Success', 'Collection created successfully', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Create Collection', headerShown: true }} />
      <ScrollView contentContainerClassName="p-4 gap-4">
        {/* Collection Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Information</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-medium">Collection Name *</Text>
              <Input
                placeholder="e.g., Laptops, Mobiles, Accessories"
                value={collectionName}
                onChangeText={setCollectionName}
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium">Description (Optional)</Text>
              <Input
                placeholder="Brief description of this collection"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
              />
            </View>
          </CardContent>
        </Card>

        {/* Fields Section */}
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold">Fields</Text>
            <Button onPress={addField} size="sm">
              <Plus size={16} className="text-primary-foreground mr-1" />
              <Text className="text-primary-foreground">Add Field</Text>
            </Button>
          </View>

          {fields.length === 0 && (
            <Card>
              <CardContent className="items-center py-8">
                <Text className="text-muted-foreground text-center">
                  No fields yet. Tap "Add Field" to start building your collection schema.
                </Text>
              </CardContent>
            </Card>
          )}

          {fields.map((field, index) => (
            <SchemaFieldEditor
              key={index}
              field={field}
              onChange={(updatedField) => updateField(index, updatedField)}
              onDelete={() => deleteField(index)}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 pb-8">
          <Button variant="outline" className="flex-1" onPress={() => router.back()}>
            <Text>Cancel</Text>
          </Button>
          <Button className="flex-1" onPress={validateAndCreate}>
            <Text>Create Collection</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
