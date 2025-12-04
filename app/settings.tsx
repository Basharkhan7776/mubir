import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Stack } from 'expo-router';
import { FileDown, FileUp, Moon, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { updateOrganizationName, updateCurrency, setSettings } from '@/lib/store/slices/settingsSlice';
import { setCollections } from '@/lib/store/slices/inventorySlice';
import { setLedger } from '@/lib/store/slices/ledgerSlice';
import { exportData, importData } from '@/lib/utils/export-import';

const CURRENCIES = [
    { value: '₹', label: '₹ Indian Rupee' },
    { value: '$', label: '$ US Dollar' },
    { value: '€', label: '€ Euro' },
    { value: '£', label: '£ British Pound' },
    { value: '¥', label: '¥ Japanese Yen' },
];

export default function SettingsScreen() {
    const { colorScheme, setColorScheme } = useColorScheme();
    const dispatch = useDispatch();
    const settings = useSelector((state: RootState) => state.settings);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleExport = async () => {
        setIsExporting(true);
        const success = await exportData();
        setIsExporting(false);
        if (success) {
            setSuccessMessage('Data exported successfully');
            setSuccessDialogOpen(true);
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        const data = await importData();
        setIsImporting(false);

        if (data) {
            // Update all Redux slices with imported data
            dispatch(setSettings(data.meta));
            dispatch(setCollections(data.collections));
            dispatch(setLedger(data.ledger));
            setSuccessMessage('Data imported successfully');
            setSuccessDialogOpen(true);
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: 'Settings', headerShown: true }} />
            <ScrollView contentContainerClassName="p-4 gap-6">
                {/* Organization Settings */}
                <View className="gap-4">
                    <Text className="text-lg font-semibold">Organization</Text>
                    <View className="gap-2">
                        <Text className="text-sm font-medium">Organization Name</Text>
                        <Input
                            placeholder="Enter your shop name"
                            value={settings.organizationName}
                            onChangeText={(text) => dispatch(updateOrganizationName(text))}
                        />
                    </View>
                    <View className="gap-2">
                        <Text className="text-sm font-medium">Currency</Text>
                        <Select
                            value={{
                                value: settings.userCurrency,
                                label: CURRENCIES.find(c => c.value === settings.userCurrency)?.label || settings.userCurrency
                            }}
                            onValueChange={(option) => option && dispatch(updateCurrency(option.value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {CURRENCIES.map((currency) => (
                                        <SelectItem key={currency.value} label={currency.label} value={currency.value}>
                                            {currency.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </View>
                </View>

                {/* Appearance */}
                <View className="gap-4">
                    <Text className="text-lg font-semibold">Appearance</Text>
                    <View className="flex-row items-center justify-between p-4 border border-border rounded-lg bg-card">
                        <View className="flex-row items-center gap-3">
                            {colorScheme === 'dark' ? (
                                <Moon size={24} className="text-foreground" />
                            ) : (
                                <Sun size={24} className="text-foreground" />
                            )}
                            <Text className="text-base font-medium">Dark Mode</Text>
                        </View>
                        <Switch
                            checked={colorScheme === 'dark'}
                            onCheckedChange={(checked) => setColorScheme(checked ? 'dark' : 'light')}
                        />
                    </View>
                </View>

                <View className="gap-4">
                    <Text className="text-lg font-semibold">Data Management</Text>
                    <View className="flex-row gap-4">
                        <Button
                            className="flex-1"
                            variant="outline"
                            onPress={handleExport}
                            disabled={isExporting}
                        >
                            <FileDown size={20} className="mr-2 text-foreground" />
                            <Text>{isExporting ? 'Exporting...' : 'Export Data'}</Text>
                        </Button>
                        <Button
                            className="flex-1"
                            variant="outline"
                            onPress={handleImport}
                            disabled={isImporting}
                        >
                            <FileUp size={20} className="mr-2 text-foreground" />
                            <Text>{isImporting ? 'Importing...' : 'Import Data'}</Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>

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
        </>
    );
}
