import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchemaFieldEditor } from '@/components/schema-builder/SchemaFieldEditor';
import { SchemaField } from '@/lib/types';
import { Plus } from 'lucide-react-native';

// We need to add an updateCollection action
import { setCollections } from '@/lib/store/slices/inventorySlice';

export default function EditSchemaScreen() {
  const { catalogId } = useLocalSearchParams<{ catalogId: string }>();
  const router = useRouter();
  const dispatch = useDispatch();

  const collections = useSelector((state: RootState) => state.inventory.collections);
  const collection = collections.find((c) => c.id === catalogId);

  const [collectionName, setCollectionName] = useState(collection?.name || '');
  const [description, setDescription] = useState(collection?.description || '');
  const [fields, setFields] = useState<SchemaField[]>(collection?.schema || []);

  if (!collection) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Collection not found</Text>
      </View>
    );
  }

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
      'Are you sure? Existing data for this field will be lost.',
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

  const validateAndSave = () => {
    if (!collectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    if (fields.length === 0) {
      Alert.alert('Error', 'Please add at least one field');
      return;
    }

    const keys = fields.map((f) => f.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      Alert.alert('Error', 'Field keys must be unique');
      return;
    }

    const hasEmptyLabels = fields.some((f) => !f.label.trim());
    if (hasEmptyLabels) {
      Alert.alert('Error', 'All fields must have labels');
      return;
    }

    const selectFieldsWithoutOptions = fields.filter(
      (f) => f.type === 'select' && (!f.options || f.options.length === 0)
    );
    if (selectFieldsWithoutOptions.length > 0) {
      Alert.alert('Error', 'Dropdown fields must have at least one option');
      return;
    }

    // Update collection
    const updatedCollections = collections.map((c) =>
      c.id === catalogId
        ? {
            ...c,
            name: collectionName.trim(),
            description: description.trim() || undefined,
            schema: fields,
          }
        : c
    );

    dispatch(setCollections(updatedCollections));

    Alert.alert('Success', 'Collection updated successfully', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Collection', headerShown: true }} />
      <ScrollView contentContainerClassName="p-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Collection Information</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-medium">Collection Name *</Text>
              <Input
                placeholder="e.g., Laptops, Mobiles"
                value={collectionName}
                onChangeText={setCollectionName}
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium">Description (Optional)</Text>
              <Input
                placeholder="Brief description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
              />
            </View>
          </CardContent>
        </Card>

        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold">Fields</Text>
            <Button onPress={addField} size="sm">
              <Plus size={16} className="text-primary-foreground mr-1" />
              <Text className="text-primary-foreground">Add Field</Text>
            </Button>
          </View>

          {fields.map((field, index) => (
            <SchemaFieldEditor
              key={index}
              field={field}
              onChange={(updatedField) => updateField(index, updatedField)}
              onDelete={() => deleteField(index)}
            />
          ))}
        </View>

        <View className="flex-row gap-4 pb-8">
          <Button variant="outline" className="flex-1" onPress={() => router.back()}>
            <Text>Cancel</Text>
          </Button>
          <Button className="flex-1" onPress={validateAndSave}>
            <Text>Save Changes</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
