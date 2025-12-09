import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { addOrganization, deleteOrganization } from '@/lib/store/slices/ledgerSlice';
import { RootState } from '@/lib/store';
import { Link, Stack } from 'expo-router';
import { Plus, Search, Trash } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { CollapsingHeaderFlatList } from '@/components/CollapsingHeaderFlatList';

export default function LedgerScreen() {
    const entries = useSelector((state: RootState) => state.ledger.entries);
    const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);
    const dispatch = useDispatch();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newType, setNewType] = useState<'ORG' | 'INDIVIDUAL'>('INDIVIDUAL');
    const [searchQuery, setSearchQuery] = useState('');
    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    };

    const handleAddParty = () => {
        if (newName.trim()) {
            dispatch(addOrganization({
                id: Date.now().toString(),
                name: newName.trim(),
                phone: newPhone,
                // Type is not in Organization schema but was in Party.
                // Assuming Organization schema is just { id, name, phone, email } for now based on types.ts
                // If type is needed, we should add it to schema. For now, ignoring type or storing in name/meta if needed.
                // But wait, the user request showed "organization" object.
            }));
            setNewName('');
            setNewPhone('');
            setNewType('INDIVIDUAL');
            setIsAdding(false);
        }
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Delete Organization",
            `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => dispatch(deleteOrganization(id))
                }
            ]
        );
    };

    const getBalance = (transactions: any[]) => {
        return transactions.reduce((acc, t) => {
            return t.type === 'CREDIT' ? acc - t.amount : acc + t.amount;
        }, 0);
    };

    const filteredEntries = useMemo(() => {
        if (!searchQuery.trim()) return entries;

        const query = searchQuery.toLowerCase();
        return entries.filter(entry =>
            entry.organization.name.toLowerCase().includes(query) ||
            entry.organization.phone?.toLowerCase().includes(query) ||
            entry.organization.email?.toLowerCase().includes(query)
        );
    }, [entries, searchQuery]);

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Ledger (Udhar)',
                    headerShown: true,
                    headerRight: () => (
                        <Pressable
                            onPress={() => setIsAdding(!isAdding)}
                            style={{ padding: 8, marginRight: 8 }}
                        >
                            <Icon as={Plus} size={24} className="text-foreground" />
                        </Pressable>
                    )
                }}
            />
            <View className="flex-1">
                <CollapsingHeaderFlatList
                    title="Ledger"
                    subtitle="Track payments and credits"
                    data={filteredEntries}
                    keyExtractor={(item) => item.organization.id}
                    contentContainerClassName="p-4 gap-4"
                    listHeaderComponent={
                        <View className="px-4 pb-4 gap-4">
                            {/* Search Bar */}
                            <View className="flex-row items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                                <Icon as={Search} size={20} className="text-muted-foreground" />
                                <Input
                                    placeholder="Search organizations..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    className="flex-1 border-0 bg-transparent"
                                />
                            </View>

                            {isAdding && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>New Party</CardTitle>
                                    </CardHeader>
                                    <CardContent className="gap-4">
                                        <Input
                                            placeholder="Name"
                                            value={newName}
                                            onChangeText={setNewName}
                                        />
                                        <Input
                                            placeholder="Phone (Optional)"
                                            value={newPhone}
                                            onChangeText={setNewPhone}
                                            keyboardType="phone-pad"
                                        />
                                    </CardContent>
                                    <CardFooter className="justify-end gap-2">
                                        <Button variant="outline" onPress={() => setIsAdding(false)}>
                                            <Text>Cancel</Text>
                                        </Button>
                                        <Button onPress={handleAddParty}>
                                            <Text>Create</Text>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}
                        </View>
                    }
                    renderItem={({ item }) => {
                        const balance = getBalance(item.transactions);
                        const balanceColor = balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-muted-foreground';
                        const balanceText = balance > 0 ? `You will get ${currencySymbol}${balance}` : balance < 0 ? `You will give ${currencySymbol}${Math.abs(balance)}` : 'Settled';

                        return (
                            <Link href={`/ledger/${item.organization.id}`} asChild>
                                <Button variant="outline" className="h-auto p-0">
                                    <Card className="w-full border-0 shadow-none">
                                        <CardHeader>
                                            <CardTitle>{item.organization.name}</CardTitle>
                                            <CardDescription>{item.organization.phone}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Text className={`font-bold ${balanceColor}`}>{balanceText}</Text>
                                        </CardContent>
                                    </Card>
                                </Button>
                            </Link>
                        );
                    }}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-8">
                            <Text className="text-muted-foreground">No parties found. Add one to start tracking.</Text>
                        </View>
                    }
                />
            </View>
        </>
    );
}
