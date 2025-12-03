import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { LayoutList, Settings, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerClassName="p-4 gap-6"
        style={{ paddingTop: insets.top }}
      >
        <View className="items-center py-8">
          <Text className="text-3xl font-bold text-primary">Mudir</Text>
          <Text className="text-muted-foreground">Shopkeeper's Assistant</Text>
        </View>

        <View className="gap-4">
          <Link href="/inventory" asChild>
            <Button variant="outline" className="h-auto p-0">
              <Card className="w-full border-0 shadow-sm bg-card">
                <CardHeader className="flex-row items-center gap-4">
                  <View className="p-3 bg-blue-100 rounded-full">
                    <LayoutList size={32} className="text-blue-600" />
                  </View>
                  <View className="flex-1">
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>Manage catalogs and items</CardDescription>
                  </View>
                </CardHeader>
              </Card>
            </Button>
          </Link>

          <Link href="/ledger" asChild>
            <Button variant="outline" className="h-auto p-0">
              <Card className="w-full border-0 shadow-sm bg-card">
                <CardHeader className="flex-row items-center gap-4">
                  <View className="p-3 bg-green-100 rounded-full">
                    <Users size={32} className="text-green-600" />
                  </View>
                  <View className="flex-1">
                    <CardTitle>Ledger</CardTitle>
                    <CardDescription>Track payments and credits</CardDescription>
                  </View>
                </CardHeader>
              </Card>
            </Button>
          </Link>
        </View>

        <View className="gap-4">
          <Link href="/settings" asChild>
            <Button variant="outline" className="h-auto p-0">
              <Card className="w-full border-0 shadow-sm bg-card">
                <CardHeader className="flex-row items-center gap-4">
                  <View className="p-3 bg-gray-100 rounded-full">
                    <Settings size={32} className="text-gray-600" />
                  </View>
                  <View className="flex-1">
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Data management and preferences</CardDescription>
                  </View>
                </CardHeader>
              </Card>
            </Button>
          </Link>
        </View>
      </ScrollView>
    </>
  );
}
