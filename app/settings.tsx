import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { FileDown, FileUp, Moon, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function SettingsScreen() {
    const { colorScheme, setColorScheme } = useColorScheme();

    return (
        <>
            <Stack.Screen options={{ title: 'Settings' }} />
            <ScrollView contentContainerClassName="p-4 gap-6">
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
                        <Button className="flex-1" variant="outline" onPress={() => { /* Implement export with Redux */ }}>
                            <FileDown size={20} className="mr-2 text-foreground" />
                            <Text>Export Data</Text>
                        </Button>
                        <Button className="flex-1" variant="outline" onPress={() => { /* Implement import with Redux */ }}>
                            <FileUp size={20} className="mr-2 text-foreground" />
                            <Text>Import Data</Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
