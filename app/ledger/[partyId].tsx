import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { addTransaction, updateOrganization, updateTransaction, deleteTransaction } from '@/lib/store/slices/ledgerSlice';
import { RootState } from '@/lib/store';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight, Search, Edit, X, Check, Trash2, Printer } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { FlatList, View, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { generateLedgerPDF } from '@/lib/pdfGenerator';

export default function PartyScreen() {
    const { partyId } = useLocalSearchParams<{ partyId: string }>();
    const entry = useSelector((state: RootState) =>
        state.ledger.entries.find((e) => e.organization.id === partyId)
    );
    const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);
    const orgName = useSelector((state: RootState) => state.settings.organizationName);
    const dispatch = useDispatch();
    const [isPrintingPDF, setIsPrintingPDF] = useState(false);

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditingOrg, setIsEditingOrg] = useState(false);
    const [editedOrgName, setEditedOrgName] = useState(entry?.organization.name || '');
    const [editedOrgPhone, setEditedOrgPhone] = useState(entry?.organization.phone || '');
    const [editedOrgEmail, setEditedOrgEmail] = useState(entry?.organization.email || '');
    const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
    const [editedTxnAmount, setEditedTxnAmount] = useState('');
    const [editedTxnRemark, setEditedTxnRemark] = useState('');
    const [editedTxnType, setEditedTxnType] = useState<'CREDIT' | 'DEBIT'>('DEBIT');
    const [editedTxnDate, setEditedTxnDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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

    const filteredTransactions = useMemo(() => {
        const reversed = [...entry.transactions].reverse();
        if (!searchQuery.trim()) return reversed;

        const query = searchQuery.toLowerCase();
        return reversed.filter(transaction =>
            transaction.amount.toString().includes(query) ||
            transaction.remark?.toLowerCase().includes(query)
        );
    }, [entry.transactions, searchQuery]);

    const handleSaveOrganization = () => {
        if (!editedOrgName.trim()) {
            setErrorMessage('Organization name cannot be empty');
            setErrorDialogOpen(true);
            return;
        }

        dispatch(updateOrganization({
            organizationId: partyId,
            updates: {
                name: editedOrgName.trim(),
                phone: editedOrgPhone.trim(),
                email: editedOrgEmail.trim(),
            }
        }));

        setIsEditingOrg(false);
        setSuccessMessage('Organization updated successfully');
        setSuccessDialogOpen(true);
    };

    const handleCancelOrganizationEdit = () => {
        setEditedOrgName(entry.organization.name);
        setEditedOrgPhone(entry.organization.phone || '');
        setEditedOrgEmail(entry.organization.email || '');
        setIsEditingOrg(false);
    };

    const handleEditTransaction = (transaction: any) => {
        setEditingTransactionId(transaction.id);
        setEditedTxnAmount(transaction.amount.toString());
        setEditedTxnRemark(transaction.remark || '');
        setEditedTxnType(transaction.type);
        setEditedTxnDate(new Date(transaction.date));
    };

    const handleSaveTransaction = () => {
        if (!editedTxnAmount || isNaN(parseFloat(editedTxnAmount))) {
            setErrorMessage('Please enter a valid amount');
            setErrorDialogOpen(true);
            return;
        }

        dispatch(updateTransaction({
            organizationId: partyId,
            transactionId: editingTransactionId!,
            updates: {
                amount: parseFloat(editedTxnAmount),
                remark: editedTxnRemark.trim(),
                type: editedTxnType,
                date: editedTxnDate.toISOString(),
            }
        }));

        setEditingTransactionId(null);
        setSuccessMessage('Transaction updated successfully');
        setSuccessDialogOpen(true);
    };

    const handleCancelTransactionEdit = () => {
        setEditingTransactionId(null);
        setEditedTxnAmount('');
        setEditedTxnRemark('');
        setEditedTxnType('DEBIT');
        setEditedTxnDate(new Date());
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setEditedTxnDate(selectedDate);
        }
    };

    const handleDeleteTransaction = (transactionId: string) => {
        setTransactionToDelete(transactionId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteTransaction = () => {
        if (transactionToDelete) {
            dispatch(deleteTransaction({
                organizationId: partyId,
                transactionId: transactionToDelete
            }));
            setDeleteDialogOpen(false);
            setTransactionToDelete(null);
        }
    };

    const handlePrintPDF = async () => {
        try {
            setIsPrintingPDF(true);
            await generateLedgerPDF(
                entry.organization,
                entry.transactions,
                currencySymbol,
                orgName || 'Mudir'
            );
            setSuccessMessage('PDF generated successfully!');
            setSuccessDialogOpen(true);
        } catch (error) {
            setErrorMessage('Failed to generate PDF. Please try again.');
            setErrorDialogOpen(true);
        } finally {
            setIsPrintingPDF(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: entry.organization.name,
                    headerShown: true,
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', marginRight: 8 }}>
                            <Pressable
                                onPress={handlePrintPDF}
                                style={{ padding: 8 }}
                                disabled={isPrintingPDF}
                            >
                                {isPrintingPDF ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <Printer size={22} color="#000" />
                                )}
                            </Pressable>
                            <Pressable
                                onPress={() => setIsEditingOrg(!isEditingOrg)}
                                style={{ padding: 8 }}
                            >
                                {isEditingOrg ? (
                                    <X size={24} color="#000" />
                                ) : (
                                    <Edit size={22} color="#000" />
                                )}
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
                        placeholder="Search by amount or remark..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 border-0 bg-transparent"
                    />
                </View>

                {/* Organization Details Card */}
                {isEditingOrg && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="gap-4">
                            <View className="gap-2">
                                <Text className="text-sm font-medium">Name *</Text>
                                <Input
                                    placeholder="Organization Name"
                                    value={editedOrgName}
                                    onChangeText={setEditedOrgName}
                                />
                            </View>
                            <View className="gap-2">
                                <Text className="text-sm font-medium">Phone</Text>
                                <Input
                                    placeholder="Phone Number"
                                    value={editedOrgPhone}
                                    onChangeText={setEditedOrgPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View className="gap-2">
                                <Text className="text-sm font-medium">Email</Text>
                                <Input
                                    placeholder="Email Address"
                                    value={editedOrgEmail}
                                    onChangeText={setEditedOrgEmail}
                                    keyboardType="email-address"
                                />
                            </View>
                            <View className="flex-row gap-2">
                                <Button variant="outline" className="flex-1" onPress={handleCancelOrganizationEdit}>
                                    <Text>Cancel</Text>
                                </Button>
                                <Button className="flex-1" onPress={handleSaveOrganization}>
                                    <Check size={18} className="text-primary-foreground mr-2" />
                                    <Text>Save</Text>
                                </Button>
                            </View>
                        </CardContent>
                    </Card>
                )}

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
                    data={filteredTransactions}
                    keyExtractor={(item) => item.id}
                    contentContainerClassName="gap-4"
                    renderItem={({ item }) => (
                        editingTransactionId === item.id ? (
                            // Edit mode
                            <Card>
                                <CardHeader>
                                    <CardTitle>Edit Transaction</CardTitle>
                                </CardHeader>
                                <CardContent className="gap-4">
                                    <View className="gap-2">
                                        <Text className="text-sm font-medium">Amount *</Text>
                                        <Input
                                            placeholder="Amount"
                                            value={editedTxnAmount}
                                            onChangeText={setEditedTxnAmount}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View className="gap-2">
                                        <Text className="text-sm font-medium">Remark</Text>
                                        <Input
                                            placeholder="Remark (Optional)"
                                            value={editedTxnRemark}
                                            onChangeText={setEditedTxnRemark}
                                        />
                                    </View>
                                    <View className="gap-2">
                                        <Text className="text-sm font-medium">Type *</Text>
                                        <View className="flex-row gap-4">
                                            <Button
                                                variant={editedTxnType === 'CREDIT' ? 'default' : 'outline'}
                                                className="flex-1"
                                                onPress={() => setEditedTxnType('CREDIT')}
                                            >
                                                <Text>You Gave (Credit)</Text>
                                            </Button>
                                            <Button
                                                variant={editedTxnType === 'DEBIT' ? 'default' : 'outline'}
                                                className="flex-1"
                                                onPress={() => setEditedTxnType('DEBIT')}
                                            >
                                                <Text>You Took (Debit)</Text>
                                            </Button>
                                        </View>
                                    </View>
                                    <View className="gap-2">
                                        <Text className="text-sm font-medium">Date *</Text>
                                        <Pressable onPress={() => setShowDatePicker(true)}>
                                            <View pointerEvents="none">
                                                <Input
                                                    value={editedTxnDate.toLocaleDateString()}
                                                    editable={false}
                                                />
                                            </View>
                                        </Pressable>
                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={editedTxnDate}
                                                mode="date"
                                                display="default"
                                                onChange={handleDateChange}
                                            />
                                        )}
                                    </View>
                                    <View className="flex-row gap-2">
                                        <Button variant="outline" className="flex-1" onPress={handleCancelTransactionEdit}>
                                            <Text>Cancel</Text>
                                        </Button>
                                        <Button className="flex-1" onPress={handleSaveTransaction}>
                                            <Check size={18} className="text-primary-foreground mr-2" />
                                            <Text>Save</Text>
                                        </Button>
                                    </View>
                                </CardContent>
                            </Card>
                        ) : (
                            // View mode
                            <Card>
                                <CardContent className="flex-row justify-between items-center p-4">
                                    <View className="flex-row items-center gap-2 flex-1">
                                        {item.type === 'CREDIT' ? (
                                            <ArrowUpRight size={24} className="text-red-600" />
                                        ) : (
                                            <ArrowDownLeft size={24} className="text-green-600" />
                                        )}
                                        <View className="flex-1">
                                            <Text className="font-bold">{item.type === 'CREDIT' ? 'You Gave' : 'You Took'}</Text>
                                            <Text className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</Text>
                                            {item.remark && <Text className="text-xs text-muted-foreground">{item.remark}</Text>}
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Text className={`font-bold ${item.type === 'CREDIT' ? 'text-red-600' : 'text-green-600'}`}>
                                            {currencySymbol}{item.amount}
                                        </Text>
                                        <Pressable onPress={() => handleEditTransaction(item)} style={{ padding: 4 }}>
                                            <Edit size={18} color="#666" />
                                        </Pressable>
                                        <Pressable onPress={() => handleDeleteTransaction(item.id)} style={{ padding: 4 }}>
                                            <Trash2 size={18} color="#ef4444" />
                                        </Pressable>
                                    </View>
                                </CardContent>
                            </Card>
                        )
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-8">
                            <Text className="text-muted-foreground">No transactions yet.</Text>
                        </View>
                    }
                />

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Transaction</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this transaction? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">
                                    <Text>Cancel</Text>
                                </Button>
                            </DialogClose>
                            <Button variant="destructive" onPress={confirmDeleteTransaction}>
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
                                {successMessage}
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
