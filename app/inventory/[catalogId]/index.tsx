import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { addItem, deleteItem } from '@/lib/store/slices/inventorySlice';
import { RootState } from '@/lib/store';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Trash2, Settings, Search } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { FlatList, View, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { DynamicFieldRenderer } from '@/components/inventory/DynamicFieldRenderer';

export default function CatalogScreen() {
    const { catalogId } = useLocalSearchParams<{ catalogId: string }>();
    const router = useRouter();
    const collection = useSelector((state: RootState) =>
        state.inventory.collections.find((c) => c.id === catalogId)
    );
    const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);
    const dispatch = useDispatch();

    const [isAdding, setIsAdding] = useState(false);
    const [newValues, setNewValues] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
            setErrorMessage('Please fill all required fields');
            setErrorDialogOpen(true);
        }
    };

    const updateValue = (key: string, value: string) => {
        setNewValues(prev => ({ ...prev, [key]: value }));
    };

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return collection.data;

        const query = searchQuery.toLowerCase();
        return collection.data.filter(item => {
            // Search across all field values
            return collection.schema.some(field => {
                const value = item.values[field.key];
                if (value === null || value === undefined) return false;

                // Convert value to string for searching
                const stringValue = value.toString().toLowerCase();
                return stringValue.includes(query);
            });
        });
    }, [collection.data, collection.schema, searchQuery]);

    return (
        <>
            <Stack.Screen
                options={{
                    title: collection.name,
                    headerShown: true,
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', marginRight: 8 }}>
                            <Pressable
                                onPress={() => router.push(`/inventory/${catalogId}/edit-schema`)}
                                style={{ padding: 8 }}
                            >
                                <Settings size={22} color="#000" />
                            </Pressable>
                            <Pressable
                                onPress={() => setIsAdding(!isAdding)}
                                style={{ padding: 8 }}
                            >
                                <Plus size={24} color="#000" />
                            </Pressable>
                        </View>
                    )
                }}
            />
            <View className="flex-1 p-4 gap-4">
                {/* Search Bar */}
                <View className="flex-row items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <Search size={20} color="#666" />
                    <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 border-0 bg-transparent"
                    />
                </View>

                {isAdding && (
                    <Card>
                        <CardHeader>
                            <CardTitle>New Item</CardTitle>
                        </CardHeader>
                        <CardContent className="gap-4">
                            {collection.schema.map((field) => (
                                <DynamicFieldRenderer
                                    key={field.key}
                                    field={field}
                                    value={newValues[field.key] ?? field.defaultValue}
                                    onChange={(value) => updateValue(field.key, value)}
                                />
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
                    data={filteredItems}
                    keyExtractor={(item) => item.id}
                    contentContainerClassName="gap-4"
                    renderItem={({ item }) => {
                        // Get first 2 fields to display
                        const displayFields = collection.schema.slice(0, 2);
                        const firstField = collection.schema[0];

                        const formatValue = (value: any, fieldType: string) => {
                            if (value === null || value === undefined) return 'N/A';

                            switch (fieldType) {
                                case 'boolean':
                                    return value ? 'Yes' : 'No';
                                case 'date':
                                    return new Date(value).toLocaleDateString();
                                case 'currency':
                                    return `${currencySymbol}${value}`;
                                default:
                                    return value.toString();
                            }
                        };

                        return (
                            <Link href={`/inventory/${catalogId}/${item.id}`} asChild>
                                <Button variant="outline" className="h-auto p-0">
                                    <Card className="w-full border-0 shadow-none">
                                        <CardHeader>
                                            <CardTitle>
                                                {item.values[firstField?.key] || 'Untitled'}
                                            </CardTitle>
                                            <View className="gap-1 mt-1">
                                                {displayFields.slice(1).map(field => (
                                                    <Text key={field.key} className="text-muted-foreground text-sm">
                                                        {field.label}: {formatValue(item.values[field.key], field.type)}
                                                    </Text>
                                                ))}
                                                {collection.schema.length > 2 && (
                                                    <Text className="text-muted-foreground text-xs italic mt-1">
                                                        Tap to view all details
                                                    </Text>
                                                )}
                                            </View>
                                        </CardHeader>
                                    </Card>
                                </Button>
                            </Link>
                        );
                    }}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-8">
                            <Text className="text-muted-foreground">No items in this collection.</Text>
                        </View>
                    }
                />

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
            </View>
        </>
    );
}
