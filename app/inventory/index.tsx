import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/store';
import { Link, Stack, useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { FlatList, View, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { createStaggeredAnimation } from '@/lib/animations';

export default function InventoryScreen() {
    const collections = useSelector((state: RootState) => state.inventory.collections);
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCollections = useMemo(() => {
        if (!searchQuery.trim()) return collections;

        const query = searchQuery.toLowerCase();
        return collections.filter(collection =>
            collection.name.toLowerCase().includes(query) ||
            collection.description?.toLowerCase().includes(query)
        );
    }, [collections, searchQuery]);

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Inventory',
                    headerShown: true,
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push('/inventory/schema-builder')}
                            style={{ padding: 8, marginRight: 8 }}
                        >
                            <Plus size={24} color="#000" />
                        </Pressable>
                    )
                }}
            />
            <View className="flex-1 p-4 gap-4">
                {/* Search Bar */}
                <View className="flex-row items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <Search size={20} color="#666" />
                    <Input
                        placeholder="Search collections..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 border-0 bg-transparent"
                    />
                </View>

                <FlatList
                    data={filteredCollections}
                    keyExtractor={(item) => item.id}
                    contentContainerClassName="gap-4"
                    renderItem={({ item, index }) => (
                        <Animated.View
                            entering={createStaggeredAnimation(index).withInitialValues({ opacity: 0 })}
                            exiting={FadeOutUp.duration(200)}
                            layout={LinearTransition.duration(300).damping(30)}
                        >
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
                        </Animated.View>
                    )}
                    ListEmptyComponent={
                        <Animated.View
                            className="items-center justify-center p-8"
                            entering={FadeInDown.delay(200).damping(30)}
                        >
                            <Text className="text-muted-foreground">No collections found. Create one to get started.</Text>
                        </Animated.View>
                    }
                />
            </View>
        </>
    );
}
