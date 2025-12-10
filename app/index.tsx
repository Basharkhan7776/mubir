import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { LayoutList, Settings, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { createStaggeredAnimation } from '@/lib/animations';
import { Icon } from '@/components/ui/icon';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { completeOnboarding } from '@/lib/store/slices/settingsSlice';
import { setCollections } from '@/lib/store/slices/inventorySlice';
import { setLedger } from '@/lib/store/slices/ledgerSlice';
import { seedDatabase } from '@/lib/seed';
import { seedData } from '@/lib/seedData';
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const isNewUser = useSelector((state: RootState) => state.settings.isNewUser);

  // Silently complete onboarding on first launch to clear the flag
  React.useEffect(() => {
    if (isNewUser) {
      dispatch(completeOnboarding());
    }
  }, [isNewUser]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerClassName="p-4 gap-6"
        style={{ paddingTop: insets.top }}
      >
        <Animated.View
          className="items-center py-8"
          entering={Platform.OS !== 'web' ? FadeInUp.duration(400).damping(30).withInitialValues({ opacity: 0 }) : undefined}
        >
          <Text className="text-3xl font-bold text-primary">Mudir</Text>
          <Text className="text-muted-foreground">Shopkeeper's Assistant</Text>
        </Animated.View>

        <View className="gap-4">
          <Animated.View
            entering={Platform.OS !== 'web' ? createStaggeredAnimation(0, FadeInDown).withInitialValues({ opacity: 0 }) : undefined}
          >
            <Link href="/inventory" asChild>
              <Button variant="outline" className="h-auto p-0">
                <Card className="w-full border-0 shadow-sm bg-card">
                  <CardHeader className="flex-row items-center gap-4">
                    <View className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
                      <Icon as={LayoutList} size={24} className="text-foreground" />
                    </View>
                    <View className="flex-1">
                      <CardTitle>Inventory</CardTitle>
                      <CardDescription>Manage catalogs and items</CardDescription>
                    </View>
                  </CardHeader>
                </Card>
              </Button>
            </Link>
          </Animated.View>

          <Animated.View
            entering={Platform.OS !== 'web' ? createStaggeredAnimation(1, FadeInDown).withInitialValues({ opacity: 0 }) : undefined}
          >
            <Link href="/ledger" asChild>
              <Button variant="outline" className="h-auto p-0">
                <Card className="w-full border-0 shadow-sm bg-card">
                  <CardHeader className="flex-row items-center gap-4">
                    <View className="p-3 bg-green-100 rounded-full dark:bg-green-900">
                      <Icon as={Users} size={24} className="text-green-600 dark:text-green-100" />
                    </View>
                    <View className="flex-1">
                      <CardTitle>Ledger</CardTitle>
                      <CardDescription>Track payments and credits</CardDescription>
                    </View>
                  </CardHeader>
                </Card>
              </Button>
            </Link>
          </Animated.View>
        </View>

        <View className="gap-4">
          <Animated.View
            entering={Platform.OS !== 'web' ? createStaggeredAnimation(2, FadeInDown).withInitialValues({ opacity: 0 }) : undefined}
          >
            <Link href="/settings" asChild>
              <Button variant="outline" className="h-auto p-0">
                <Card className="w-full border-0 shadow-sm bg-card">
                  <CardHeader className="flex-row items-center gap-4">
                    <View className="p-3 bg-gray-100 rounded-full dark:bg-gray-800">
                      <Icon as={Settings} size={24} className="text-gray-600 dark:text-gray-100" />
                    </View>
                    <View className="flex-1">
                      <CardTitle>Settings</CardTitle>
                      <CardDescription>Data management and preferences</CardDescription>
                    </View>
                  </CardHeader>
                </Card>
              </Button>
            </Link>
          </Animated.View>
        </View>
      </ScrollView>
    </>
  );
}
