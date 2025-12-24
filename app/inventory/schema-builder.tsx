import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { SchemaFieldEditor } from '@/components/schema-builder/SchemaFieldEditor';
import { SchemaField } from '@/lib/types';
import { Plus } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { addCollection } from '@/lib/store/slices/inventorySlice';
import { Icon } from '@/components/ui/icon';

export default function SchemaBuilderScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<number | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

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
    setFieldToDelete(index);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteField = () => {
    if (fieldToDelete !== null) {
      const newFields = fields.filter((_, i) => i !== fieldToDelete);
      setFields(newFields);
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
    }
  };

  const validateAndCreate = () => {
    // Validation
    if (!collectionName.trim()) {
      setErrorMessage('Please enter a collection name');
      setErrorDialogOpen(true);
      return;
    }

    if (fields.length === 0) {
      setErrorMessage('Please add at least one field');
      setErrorDialogOpen(true);
      return;
    }

    // Check for duplicate field keys
    const keys = fields.map((f) => f.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      setErrorMessage('Field keys must be unique. Please check for duplicates.');
      setErrorDialogOpen(true);
      return;
    }

    // Check that all fields have labels
    const hasEmptyLabels = fields.some((f) => !f.label.trim());
    if (hasEmptyLabels) {
      setErrorMessage('All fields must have labels');
      setErrorDialogOpen(true);
      return;
    }

    // Check that select fields have options
    const selectFieldsWithoutOptions = fields.filter(
      (f) => f.type === 'select' && (!f.options || f.options.length === 0)
    );
    if (selectFieldsWithoutOptions.length > 0) {
      setErrorMessage('Dropdown fields must have at least one option');
      setErrorDialogOpen(true);
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

    setSuccessDialogOpen(true);
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
              <Icon as={Plus} size={16} className="text-primary-foreground mr-1" />
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

      {/* Delete Field Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Field</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this field?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <Text>Cancel</Text>
              </Button>
            </DialogClose>
            <Button variant="destructive" onPress={confirmDeleteField}>
              <Text className="text-destructive-foreground">Delete</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button>
                <Text>OK</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              Collection created successfully
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button onPress={() => router.back()}>
                <Text>OK</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
