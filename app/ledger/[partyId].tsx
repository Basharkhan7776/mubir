import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { addTransaction } from '@/lib/store/slices/ledgerSlice';
import { RootState } from '@/lib/store';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function PartyScreen() {
    const { partyId } = useLocalSearchParams<{ partyId: string }>();
    const entry = useSelector((state: RootState) =>
        state.ledger.entries.find((e) => e.organization.id === partyId)
    );
    const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);
    const dispatch = useDispatch();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    if (!entry) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Party not found</Text>
            </View>
        );
    }

    const handleTransaction = (type: 'CREDIT' | 'DEBIT') => {
        if (amount && !isNaN(parseFloat(amount))) {
            dispatch(addTransaction({
                organizationId: partyId,
                transaction: {
                    id: Date.now().toString(),
                    organizationId: partyId,
                    type,
                    amount: parseFloat(amount),
                    date: new Date().toISOString(),
                    remark: description.trim(),
                }
            }));
            setAmount('');
            setDescription('');
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: entry.organization.name, headerShown: true }} />
            <View className="flex-1 p-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>New Transaction</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <Input
                            placeholder="Amount"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                        <Input
                            placeholder="Description (Optional)"
                            value={description}
                            onChangeText={setDescription}
                        />
                        <View className="flex-row gap-4">
                            <Button
                                className="flex-1 bg-red-600"
                                onPress={() => handleTransaction('CREDIT')}
                            >
                                <Text className="text-white">You Gave (Credit)</Text>
                            </Button>
                            <Button
                                className="flex-1 bg-green-600"
                                onPress={() => handleTransaction('DEBIT')}
                            >
                                <Text className="text-white">You Took (Debit)</Text>
                            </Button>
                        </View>
                    </CardContent>
                </Card>

                <FlatList
                    data={[...entry.transactions].reverse()}
                    keyExtractor={(item) => item.id}
                    contentContainerClassName="gap-4"
                    renderItem={({ item }) => (
                        <Card>
                            <CardContent className="flex-row justify-between items-center p-4">
                                <View className="flex-row items-center gap-2">
                                    {item.type === 'CREDIT' ? (
                                        <ArrowUpRight size={24} className="text-red-600" />
                                    ) : (
                                        <ArrowDownLeft size={24} className="text-green-600" />
                                    )}
                                    <View>
                                        <Text className="font-bold">{item.type === 'CREDIT' ? 'You Gave' : 'You Took'}</Text>
                                        <Text className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</Text>
                                        {item.remark && <Text className="text-xs text-muted-foreground">{item.remark}</Text>}
                                    </View>
                                </View>
                                <Text className={`font-bold ${item.type === 'CREDIT' ? 'text-red-600' : 'text-green-600'}`}>
                                    {currencySymbol}{item.amount}
                                </Text>
                            </CardContent>
                        </Card>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-8">
                            <Text className="text-muted-foreground">No transactions yet.</Text>
                        </View>
                    }
                />
            </View>
        </>
    );
}
