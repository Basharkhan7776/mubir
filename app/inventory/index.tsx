import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { addCollection } from '@/lib/store/slices/inventorySlice';
import { RootState } from '@/lib/store';
import { Link, Stack, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function InventoryScreen() {
    const collections = useSelector((state: RootState) => state.inventory.collections);
    const dispatch = useDispatch();
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const router = useRouter();

    const handleAddCollection = () => {
        if (newCollectionName.trim()) {
            dispatch(addCollection({
                id: Date.now().toString(),
                name: newCollectionName.trim(),
                schema: [ // Default schema for now, or make this dynamic later
                    { key: 'name', label: 'Name', type: 'text', required: true },
                    { key: 'quantity', label: 'Quantity', type: 'number', defaultValue: 0 },
                    { key: 'price', label: 'Price', type: 'currency' }
                ],
                data: []
            }));
            setNewCollectionName('');
            setIsAdding(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{
                title: 'Inventory', headerRight: () => (
                    <Button size="icon" variant="ghost" onPress={() => setIsAdding(!isAdding)}>
                        <Plus size={24} color="black" />
                    </Button>
                )
            }} />
            <View className="flex-1 p-4 gap-4">
                {isAdding && (
                    <Card>
                        <CardHeader>
                            <CardTitle>New Collection</CardTitle>
                        </CardHeader>
                        <CardContent className="gap-4">
                            <Input
                                placeholder="Collection Name"
                                value={newCollectionName}
                                onChangeText={setNewCollectionName}
                            />
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button variant="outline" onPress={() => setIsAdding(false)}>
                                <Text>Cancel</Text>
                            </Button>
                            <Button onPress={handleAddCollection}>
                                <Text>Create</Text>
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                <FlatList
                    data={collections}
                    keyExtractor={(item) => item.id}
                    contentContainerClassName="gap-4"
                    renderItem={({ item }) => (
                        <Link href={`/inventory/${item.id}`} asChild>
                            <Button variant="outline" className="h-auto p-0">
                                <Card className="w-full border-0 shadow-none">
                                    <CardHeader>
                                        <CardTitle>{item.name}</CardTitle>
                                        <CardDescription>{item.data.length} items</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Button>
                        </Link>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-8">
                            <Text className="text-muted-foreground">No collections found. Create one to get started.</Text>
                        </View>
                    }
                />
            </View>
        </>
    );
}
