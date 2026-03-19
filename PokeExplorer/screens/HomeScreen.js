import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator, Image,
  Dimensions, StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const TYPE_COLORS = {
  fire: '#FF6B35', water: '#4A9EFF', grass: '#5DBE62', electric: '#F9CF30',
  psychic: '#FF6EA0', ice: '#74D7D7', dragon: '#6C5CE7', dark: '#4A3728',
  fairy: '#FF8EBF', normal: '#9B9B6A', fighting: '#C0392B', flying: '#8FA8E8',
  poison: '#9B59B6', ground: '#C8A84B', rock: '#9A8031', bug: '#7FAD18',
  ghost: '#5B4E8B', steel: '#8A8AB0', default: '#888',
};

const TYPES = [
  'all','fire','water','grass','electric','psychic','ice',
  'dragon','dark','fairy','normal','fighting','flying','poison','bug','ghost','steel','rock',
];

const TYPE_ICONS = {
  all:'🌐', fire:'🔥', water:'💧', grass:'🌿', electric:'⚡',
  psychic:'🔮', ice:'❄️', dragon:'🐉', dark:'🌑', fairy:'✨',
  normal:'⭐', fighting:'🥊', flying:'🦅', poison:'☠️', bug:'🐛',
  ghost:'👻', steel:'⚙️', rock:'🪨',
};

export default function HomeScreen({ navigation }) {
  const [pokemon, setPokemon] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => { fetchPokemon(); }, []);

  useEffect(() => {
    let result = pokemon;
    if (search.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id).includes(search)
      );
    }
    if (selectedType !== 'all') {
      result = result.filter(p => p.types.some(t => t.type.name === selectedType));
    }
    setFiltered(result);
  }, [search, selectedType, pokemon]);

  const fetchPokemon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
      if (!res.ok) throw new Error('Failed to fetch Pokémon list');
      const data = await res.json();
      const details = await Promise.all(
        data.results.map(async (p) => {
          const r = await fetch(p.url);
          if (!r.ok) throw new Error('Failed to fetch details');
          return r.json();
        })
      );
      setPokemon(details);
    } catch (e) {
      setError(e.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTypeColor = (type) => TYPE_COLORS[type] || TYPE_COLORS.default;

  const renderPokemon = ({ item }) => {
    const mainType = item.types[0].type.name;
    const color = getTypeColor(mainType);
    const id = String(item.id).padStart(3, '0');
    const image =
      item.sprites.other?.['official-artwork']?.front_default ||
      item.sprites.front_default;

    return (
      <TouchableOpacity
        style={[styles.card, { borderColor: color + '55' }]}
        onPress={() => navigation.navigate('Detail', { pokemon: item })}
        activeOpacity={0.85}
      >
        {/* Pokéball background circle */}
        <View style={[styles.cardBallBg, { backgroundColor: color + '18' }]} />
        <View style={[styles.cardBallLine, { backgroundColor: color + '33' }]} />

        <Image source={{ uri: image }} style={styles.sprite} resizeMode="contain" />
        <Text style={[styles.pokeId, { color: color }]}>#{id}</Text>
        <Text style={styles.pokeName}>
          {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
        </Text>
        <View style={styles.typeRow}>
          {item.types.map((t) => (
            <View
              key={t.type.name}
              style={[styles.typeBadge, { backgroundColor: getTypeColor(t.type.name) }]}
            >
              <Text style={styles.typeText}>{t.type.name}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View>
      {/* App Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroBallDeco} />
        <View style={styles.heroBallDeco2} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>PokéExplorer</Text>
          <Text style={styles.heroSub}>
            Discover all 151 original Pokémon — browse, compare & play!
          </Text>
        </View>
        <Text style={styles.heroPokeball}>⬤</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by name or number..."
          placeholderTextColor="#6B7280"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filter */}
      <FlatList
        data={TYPES}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterBtn,
              selectedType === item && { backgroundColor: getTypeColor(item), borderColor: getTypeColor(item) },
            ]}
            onPress={() => setSelectedType(item)}
          >
            <Text style={styles.filterIcon}>{TYPE_ICONS[item] || '•'}</Text>
            <Text style={[styles.filterText, selectedType === item && { color: '#fff' }]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.count}>
        {loading ? 'Loading…' : `${filtered.length} Pokémon found`}
      </Text>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😵</Text>
        <Text style={styles.errorTitle}>Oops! Connection failed</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchPokemon}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#CC0000" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ListHeader />
          <View style={styles.centered}>
            <View style={styles.pokeball}>
              <View style={styles.pokeballTop} />
              <View style={styles.pokeballMid} />
              <View style={styles.pokeballBot} />
              <View style={styles.pokeballBtn} />
            </View>
            <Text style={styles.loadingText}>Catching Pokémon...</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          renderItem={renderPokemon}
          contentContainerStyle={styles.grid}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔭</Text>
              <Text style={styles.emptyText}>No Pokémon found!</Text>
              <Text style={styles.emptySub}>Try a different search or type.</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchPokemon}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },

  /* Hero Banner */
  heroBanner: {
    backgroundColor: '#CC0000',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 14,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBallDeco: {
    position: 'absolute', right: -30, top: -30,
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroBallDeco2: {
    position: 'absolute', right: 10, top: 60,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: { zIndex: 2 },
  heroTitle: {
    color: '#fff', fontSize: 26, fontWeight: '900',
    letterSpacing: 1, marginBottom: 4,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)', fontSize: 13,
    lineHeight: 18, maxWidth: width * 0.65,
  },
  heroPokeball: {
    position: 'absolute', right: 20, top: '50%',
    fontSize: 60, color: 'rgba(255,255,255,0.15)',
    transform: [{ translateY: -30 }],
  },

  /* Search */
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#1E1E2E', borderRadius: 14,
    paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#2A2A3E',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: {
    flex: 1, color: '#fff', fontSize: 14,
    paddingVertical: 13,
  },
  clearBtn: { padding: 6 },
  clearText: { color: '#888', fontSize: 14 },

  /* Type Filter */
  filterList: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#1E1E2E',
    borderWidth: 1.5, borderColor: '#2A2A3E', gap: 4,
  },
  filterIcon: { fontSize: 12 },
  filterText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },

  count: {
    color: '#6B7280', fontSize: 12,
    marginHorizontal: 20, marginBottom: 8,
  },

  /* Cards */
  grid: { paddingHorizontal: 8, paddingBottom: 30 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    margin: 6,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
    elevation: 4,
  },
  cardBallBg: {
    position: 'absolute', top: -20, right: -20,
    width: 80, height: 80, borderRadius: 40,
  },
  cardBallLine: {
    position: 'absolute', top: 20, left: 0, right: 0,
    height: 1,
  },
  sprite: { width: CARD_WIDTH * 0.65, height: CARD_WIDTH * 0.65 },
  pokeId: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  pokeName: {
    color: '#F9FAFB', fontSize: 14, fontWeight: '800',
    marginTop: 2, textTransform: 'capitalize', textAlign: 'center',
  },
  typeRow: {
    flexDirection: 'row', gap: 4, marginTop: 8,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10,
  },
  typeText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  /* Loading */
  loadingContainer: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  pokeball: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: '#CC0000',
    overflow: 'hidden', position: 'relative',
    backgroundColor: '#1E1E2E',
  },
  pokeballTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '50%', backgroundColor: '#CC0000',
  },
  pokeballMid: {
    position: 'absolute', top: '46%', left: 0, right: 0,
    height: 4, backgroundColor: '#CC0000',
  },
  pokeballBot: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '50%', backgroundColor: '#1E1E2E',
  },
  pokeballBtn: {
    position: 'absolute', top: '50%', left: '50%',
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 3, borderColor: '#CC0000',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 10,
  },
  loadingText: { color: '#9CA3AF', marginTop: 20, fontSize: 14, fontWeight: '600' },

  /* Error */
  errorContainer: {
    flex: 1, backgroundColor: '#0F0F1A',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  errorEmoji: { fontSize: 60, marginBottom: 16 },
  errorTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  errorMsg: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  retryBtn: {
    backgroundColor: '#CC0000', borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  retryText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  /* Empty */
  emptyBox: { alignItems: 'center', marginTop: 50, padding: 20 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: '#E5E7EB', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: '#6B7280', fontSize: 13 },
});