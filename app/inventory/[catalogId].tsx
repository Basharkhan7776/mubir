import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { addItem, deleteItem } from '@/lib/store/slices/inventorySlice';
import { RootState } from '@/lib/store';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, View, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function CatalogScreen() {
    const { catalogId } = useLocalSearchParams<{ catalogId: string }>();
    const collection = useSelector((state: RootState) =>
        state.inventory.collections.find((c) => c.id === catalogId)
    );
    const dispatch = useDispatch();

    const [isAdding, setIsAdding] = useState(false);
    const [newValues, setNewValues] = useState<Record<string, any>>({});

    if (!collection) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Collection not found</Text>
            </View>
        );
    }

    const handleAddItem = () => {
        // Basic validation: check required fields
        const isValid = collection.schema.every(field => {
            if (field.required && !newValues[field.key]) return false;
            return true;
        });

        if (isValid) {
            dispatch(addItem({
                collectionId: catalogId,
                item: {
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    values: { ...newValues }
                }
            }));
            setNewValues({});
            setIsAdding(false);
        } else {
            Alert.alert('Error', 'Please fill all required fields');
        }
    };

    const updateValue = (key: string, value: string) => {
        setNewValues(prev => ({ ...prev, [key]: value }));
    };

    return (
        <>
            <Stack.Screen options={{
                title: collection.name, headerRight: () => (
                    <Button size="icon" variant="ghost" onPress={() => setIsAdding(!isAdding)}>
                        <Plus size={24} color="black" />
                    </Button>
                )
            }} />
            <View className="flex-1 p-4 gap-4">
                {isAdding && (
                    <Card>
                        <CardHeader>
                            <CardTitle>New Item</CardTitle>
                        </CardHeader>
                        <CardContent className="gap-4">
                            {collection.schema.map((field) => (
                                <View key={field.key} className="gap-2">
                                    <Text className="text-sm font-medium">{field.label}</Text>
                                    <Input
                                        placeholder={field.label}
                                        value={newValues[field.key]?.toString() || ''}
                                        onChangeText={(text) => updateValue(field.key, text)}
                                        keyboardType={field.type === 'number' || field.type === 'currency' ? 'numeric' : 'default'}
                                    />
                                </View>
                            ))}
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button variant="outline" onPress={() => setIsAdding(false)}>
                                <Text>Cancel</Text>
                            </Button>
                            <Button onPress={handleAddItem}>
                                <Text>Add</Text>
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                <FlatList
                    data={collection.data}
                    keyExtractor={(item) => item.id}
                    contentContainerClassName="gap-4"
                    renderItem={({ item }) => (
                        <Card>
                            <CardHeader className="flex-row justify-between items-center">
                                <View>
                                    {/* Display first text field as title, others as details */}
                                    <CardTitle>
                                        {item.values[collection.schema.find(f => f.key === 'name')?.key || collection.schema[0].key]}
                                    </CardTitle>
                                    <View className="flex-row flex-wrap gap-2 mt-1">
                                        {collection.schema.slice(1).map(field => (
                                            <Text key={field.key} className="text-muted-foreground text-sm">
                                                {field.label}: {item.values[field.key]}
                                            </Text>
                                        ))}
                                    </View>
                                </View>
                                <Button variant="ghost" size="icon" onPress={() => dispatch(deleteItem({ collectionId: catalogId, itemId: item.id }))}>
                                    <Trash2 size={20} className="text-destructive" />
                                </Button>
                            </CardHeader>
                        </Card>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-8">
                            <Text className="text-muted-foreground">No items in this collection.</Text>
                        </View>
                    }
                />
            </View>
        </>
    );
}
