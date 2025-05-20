/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import messaging, {
  getMessaging,
  getToken,
} from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';
import type {PropsWithChildren} from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {getApp} from '@react-native-firebase/app';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const mess = getMessaging(getApp());

  const [loop, setloop] = useState(true);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    // checkToken();
    useToken();
  }, []);

  // const checkToken = async () => {
  //   const fcmToken = await getToken();
  //   console.log("GET FCM TOKEN", fcmToken);
  //   if (fcmToken) {
  //     console.log("ADA")
  //     console.log(fcmToken);
  //   }
  // };

  const getFcmToken = async () => {
    const fcmToken = await getToken(mess); // Gunakan getToken dari modular API
    if (fcmToken) {
      console.log(Platform.OS, fcmToken);
      console.log('Your Firebase Token is:', fcmToken);
    } else {
      console.log('Failed', 'No Token Received');
    }
  };
  const useToken = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      getFcmToken();
      console.log('Authorization status:', authStatus);
    }
  };

  const [initialNotificationData, setInitialNotificationData] = useState<any>();
  const [foregroundNotificationData, setForegroundNotificationData] =
    useState<any>();
  const [openedAppNotificationData, setOpenedAppNotificationData] =
    useState<any>();

  useEffect(() => {
    // Handle when the app is opened from a background/quit state by tapping a notification
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage?.data) {
          console.log('Initial Notification Data:', remoteMessage);
          setInitialNotificationData(remoteMessage?.data);
          // You can now use initialNotificationData to perform your custom navigation
          await analytics().logEvent('custom_notif_received', {
            title: remoteMessage?.notification?.title,
            notification_text: remoteMessage?.notification?.body,
          });
          console.log(remoteMessage);
        }
      });

    // Listen for foreground notifications (when the app is open)
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      if (remoteMessage?.data) {
        console.log('Foreground Notification Data:', remoteMessage);
        setForegroundNotificationData(remoteMessage.data);
        // You can decide if you want to navigate immediately on foreground\
      }
    });

    // Listen for when the user taps on a notification while the app is in the foreground
    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(
      async remoteMessage => {
        if (remoteMessage?.data) {
          console.log(
            'Notification Opened App Data:',
            remoteMessage?.notification,
          );
          setOpenedAppNotificationData(remoteMessage.data);
          // Use openedAppNotificationData to perform your custom navigation
        }
      },
    );

    messaging().subscribeToTopic('promoMay');

    return () => {
      unsubscribeForeground();
      unsubscribeOpenedApp();
    };
  }, []);

  /*
   * To keep the template simple and small we're adding padding to prevent view
   * from rendering under the System UI.
   * For bigger apps the recommendation is to use `react-native-safe-area-context`:
   * https://github.com/AppAndFlow/react-native-safe-area-context
   *
   * You can read more about it here:
   * https://github.com/react-native-community/discussions-and-proposals/discussions/827
   */
  const safePadding = '5%';

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={backgroundStyle}>
        <View style={{paddingRight: safePadding}}>
          <Header />
        </View>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            paddingHorizontal: safePadding,
            paddingBottom: safePadding,
          }}>
          {initialNotificationData && (
            <Text>
              Initial Notification Data:{' '}
              {JSON.stringify(initialNotificationData)}
            </Text>
          )}
          {foregroundNotificationData && (
            <Text>
              Foreground Notification Data:{' '}
              {JSON.stringify(foregroundNotificationData)}
            </Text>
          )}
          {openedAppNotificationData && (
            <Text>
              Opened App Notification Data:{' '}
              {JSON.stringify(openedAppNotificationData)}
            </Text>
          )}
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
