import { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View, Text, StyleSheet, Animated, Easing,
  Dimensions, StatusBar,
} from 'react-native';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import GuessScreen from './screens/GuessScreen';
import CompareScreen from './screens/CompareScreen';

const { width, height } = Dimensions.get('window');
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HEADER_OPTIONS = {
  headerStyle: { backgroundColor: '#CC0000' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '900', fontSize: 18 },
  headerShadowVisible: false,
  // Slide transition for stack screens
  animation: 'slide_from_right',
};

// ─── Pokéball SVG-style logo drawn in RN ────────────────────────────────────
function PokeballLogo({ size = 100 }) {
  return (
    <View style={[logo.ball, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={logo.topHalf} />
      <View style={logo.midLine} />
      <View style={logo.botHalf} />
      <View style={[logo.centerBtn, {
        width: size * 0.28, height: size * 0.28,
        borderRadius: size * 0.14,
        top: size * 0.5 - size * 0.14,
        left: size * 0.5 - size * 0.14,
      }]}>
        <View style={[logo.centerInner, {
          width: size * 0.14, height: size * 0.14,
          borderRadius: size * 0.07,
        }]} />
      </View>
    </View>
  );
}
const logo = StyleSheet.create({
  ball: {
    overflow: 'hidden', position: 'relative',
    borderWidth: 4, borderColor: '#fff',
    elevation: 12,
    shadowColor: '#CC0000', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 20,
  },
  topHalf: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '50%', backgroundColor: '#CC0000',
  },
  midLine: {
    position: 'absolute', top: '47%', left: 0, right: 0,
    height: '6%', backgroundColor: '#fff',
    zIndex: 1,
  },
  botHalf: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '50%', backgroundColor: '#1A1A2E',
  },
  centerBtn: {
    position: 'absolute', backgroundColor: '#fff',
    zIndex: 2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#333',
  },
  centerInner: { backgroundColor: '#CC0000' },
});

// ─── Animated Splash Screen ──────────────────────────────────────────────────
function SplashScreen({ onFinish }) {
  // Animations
  const ballScale   = useRef(new Animated.Value(0)).current;
  const ballRotate  = useRef(new Animated.Value(0)).current;
  const ballY       = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY      = useRef(new Animated.Value(30)).current;
  const subOpacity  = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const bgScale     = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Ball pops in with a bounce
      Animated.spring(ballScale, {
        toValue: 1, tension: 60, friction: 5,
        useNativeDriver: true,
      }),
      // 2. Ball spins once
      Animated.timing(ballRotate, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 3. Ball rises up + title fades in simultaneously
      Animated.parallel([
        Animated.timing(ballY, {
          toValue: -30, duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1, duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0, duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // 4. Subtitle fades in
      Animated.timing(subOpacity, {
        toValue: 1, duration: 350,
        useNativeDriver: true,
      }),
      // 5. Hold
      Animated.delay(700),
      // 6. Zoom out + fade away
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 0, duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bgScale, {
          toValue: 1.15, duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onFinish());
  }, []);

  const spin = ballRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[splash.container, { opacity: screenOpacity, transform: [{ scale: bgScale }] }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />

      {/* Background decorative circles */}
      <View style={splash.bgCircle1} />
      <View style={splash.bgCircle2} />
      <View style={splash.bgCircle3} />

      {/* Pokéball */}
      <Animated.View style={{
        transform: [
          { scale: ballScale },
          { rotate: spin },
          { translateY: ballY },
        ],
      }}>
        <PokeballLogo size={110} />
      </Animated.View>

      {/* Title */}
      <Animated.Text style={[splash.title, {
        opacity: titleOpacity,
        transform: [{ translateY: titleY }],
      }]}>
        PokéExplorer
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text style={[splash.sub, { opacity: subOpacity }]}>
        Gotta catch 'em all! 
      </Animated.Text>

      {/* Bottom tag */}
      <Animated.Text style={[splash.tag, { opacity: subOpacity }]}>
        Gen I • 151 Pokémon
      </Animated.Text>
    </Animated.View>
  );
}

const splash = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0F0F1A',
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute', top: 0, left: 0,
    width, height, zIndex: 999,
  },
  bgCircle1: {
    position: 'absolute', width: 320, height: 320,
    borderRadius: 160, backgroundColor: '#CC000018',
    top: -80, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: '#CC000012',
    bottom: 60, left: -60,
  },
  bgCircle3: {
    position: 'absolute', width: 120, height: 120,
    borderRadius: 60, backgroundColor: '#CC000010',
    bottom: 200, right: 30,
  },
  title: {
    color: '#FFFFFF', fontSize: 36, fontWeight: '900',
    letterSpacing: 1, marginTop: 24,
    textShadowColor: '#CC0000', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  sub: {
    color: '#9CA3AF', fontSize: 15, marginTop: 8, fontWeight: '500',
  },
  tag: {
    position: 'absolute', bottom: 48,
    color: '#374151', fontSize: 12, fontWeight: '700', letterSpacing: 2,
  },
});

// ─── Tab Icon ────────────────────────────────────────────────────────────────
function TabIcon({ emoji, focused }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.25 : 1,
      tension: 120, friction: 6,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.Text style={{ fontSize: 20, transform: [{ scale }], opacity: focused ? 1 : 0.45 }}>
      {emoji}
    </Animated.Text>
  );
}

// ─── Home Stack ──────────────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTIONS}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '⚡ PokéExplorer' }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={({ route }) => ({
          title: route.params?.pokemon?.name
            ? route.params.pokemon.name.charAt(0).toUpperCase() + route.params.pokemon.name.slice(1)
            : 'Pokémon Details',
        })}
      />
    </Stack.Navigator>
  );
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F1A' }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#1A1A2E',
              borderTopColor: '#CC0000',
              borderTopWidth: 2,
              height: 62,
              paddingBottom: 8,
              paddingTop: 4,
            },
            tabBarActiveTintColor: '#CC0000',
            tabBarInactiveTintColor: '#4B5563',
            tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
          }}
        >
          <Tab.Screen
            name="Explore"
            component={HomeStack}
            options={{
              tabBarLabel: 'Explore',
              tabBarIcon: ({ focused }) => <TabIcon emoji="🎮" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="GuessingGame"
            component={GuessScreen}
            options={{
              tabBarLabel: 'Who is it?',
              tabBarIcon: ({ focused }) => <TabIcon emoji="🎲" focused={focused} />,
              headerShown: true,
              ...HEADER_OPTIONS,
              headerTitle: '👁️ Who is That Pokémon?',
            }}
          />
          <Tab.Screen
            name="Compare"
            component={CompareScreen}
            options={{
              tabBarLabel: 'Battle',
              tabBarIcon: ({ focused }) => <TabIcon emoji="⚔️" focused={focused} />,
              headerShown: true,
              ...HEADER_OPTIONS,
              headerTitle: '⚔️ Pokémon Battle',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>

      {/* Splash renders on top until animation completes */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    </View>
  );
}