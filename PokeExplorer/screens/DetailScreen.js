import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, ActivityIndicator, RefreshControl,
  Dimensions, TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

const TYPE_COLORS = {
  fire: '#FF6B35', water: '#4A9EFF', grass: '#5DBE62', electric: '#F9CF30',
  psychic: '#FF6EA0', ice: '#74D7D7', dragon: '#6C5CE7', dark: '#4A3728',
  fairy: '#FF8EBF', normal: '#9B9B6A', fighting: '#C0392B', flying: '#8FA8E8',
  poison: '#9B59B6', ground: '#C8A84B', rock: '#9A8031', bug: '#7FAD18',
  ghost: '#5B4E8B', steel: '#8A8AB0', default: '#888',
};

const STAT_COLORS = {
  hp: '#FF5959', attack: '#F5AC78', defense: '#FAE078',
  'special-attack': '#9DB7F5', 'special-defense': '#A7DB8D', speed: '#FA92B2',
};

const STAT_LABELS = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'Sp.ATK', 'special-defense': 'Sp.DEF', speed: 'SPD',
};

function getTypeColor(type) { return TYPE_COLORS[type] || TYPE_COLORS.default; }
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function StatBar({ stat, value, color }) {
  const pct = Math.min((value / 255) * 100, 100);
  return (
    <View style={statStyles.row}>
      <Text style={statStyles.label}>{STAT_LABELS[stat] || stat.toUpperCase()}</Text>
      <Text style={[statStyles.value, { color: STAT_COLORS[stat] || '#fff' }]}>
        {value}
      </Text>
      <View style={statStyles.barBg}>
        <View
          style={[
            statStyles.barFill,
            { width: `${pct}%`, backgroundColor: STAT_COLORS[stat] || color },
          ]}
        />
      </View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', width: 70, textTransform: 'uppercase' },
  value: { fontSize: 13, fontWeight: '800', width: 36, textAlign: 'right', marginRight: 12 },
  barBg: {
    flex: 1, height: 8, backgroundColor: '#2A2A3E',
    borderRadius: 6, overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 6 },
});

export default function DetailScreen({ route }) {
  const { pokemon } = route.params;
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  const mainType = pokemon.types[0].type.name;
  const color = getTypeColor(mainType);
  const id = String(pokemon.id).padStart(3, '0');
  const image =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default;

  const fetchSpecies = useCallback(async () => {
    try {
      const res = await fetch(pokemon.species.url);
      if (!res.ok) throw new Error('Species not found');
      const data = await res.json();
      setSpecies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pokemon]);

  useEffect(() => { fetchSpecies(); }, [fetchSpecies]);

  const onRefresh = () => { setRefreshing(true); fetchSpecies(); };

  const getDescription = () => {
    if (!species) return 'Loading description...';
    const entry = species.flavor_text_entries.find(e => e.language.name === 'en');
    return entry ? entry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') : 'No description available.';
  };

  const getCategory = () => {
    if (!species) return '';
    const genus = species.genera?.find(g => g.language.name === 'en');
    return genus ? genus.genus : '';
  };

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'stats', label: 'Stats' },
    { id: 'moves', label: 'Moves' },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: color + '30' }]}>
        {/* Pokéball deco */}
        <View style={[styles.ballDeco, { borderColor: color + '40' }]} />
        <View style={[styles.ballDecoInner, { backgroundColor: color + '15' }]} />

        <Text style={styles.idText}>#{id}</Text>
        <Text style={styles.nameText}>{capitalize(pokemon.name)}</Text>
        {getCategory() !== '' && (
          <Text style={[styles.category, { color: color }]}>{getCategory()}</Text>
        )}

        <View style={styles.typeRow}>
          {pokemon.types.map((t) => (
            <View
              key={t.type.name}
              style={[styles.typeBadge, { backgroundColor: getTypeColor(t.type.name) }]}
            >
              <Text style={styles.typeText}>{capitalize(t.type.name)}</Text>
            </View>
          ))}
        </View>

        <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
      </View>

      {/* Quick Stats Row */}
      <View style={styles.quickRow}>
        <View style={styles.quickItem}>
          <Text style={styles.quickVal}>{(pokemon.height / 10).toFixed(1)} m</Text>
          <Text style={styles.quickLabel}>Height</Text>
        </View>
        <View style={[styles.quickDivider, { backgroundColor: color + '44' }]} />
        <View style={styles.quickItem}>
          <Text style={styles.quickVal}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
          <Text style={styles.quickLabel}>Weight</Text>
        </View>
        <View style={[styles.quickDivider, { backgroundColor: color + '44' }]} />
        <View style={styles.quickItem}>
          <Text style={styles.quickVal}>{pokemon.base_experience ?? '—'}</Text>
          <Text style={styles.quickLabel}>Base XP</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && [styles.tabActive, { borderBottomColor: color }]]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && { color }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>

        {/* About Tab */}
        {activeTab === 'about' && (
          <View>
            {loading ? (
              <ActivityIndicator color={color} style={{ marginVertical: 20 }} />
            ) : (
              <>
                <View style={[styles.descBox, { borderLeftColor: color }]}>
                  <Text style={styles.descText}>{getDescription()}</Text>
                </View>
                <Text style={styles.sectionTitle}>Abilities</Text>
                <View style={styles.abilitiesRow}>
                  {pokemon.abilities.map((a) => (
                    <View
                      key={a.ability.name}
                      style={[styles.abilityBadge, { borderColor: color }]}
                    >
                      <Text style={styles.abilityText}>
                        {capitalize(a.ability.name.replace(/-/g, ' '))}
                      </Text>
                      {a.is_hidden && (
                        <View style={[styles.hiddenTag, { backgroundColor: color }]}>
                          <Text style={styles.hiddenText}>Hidden</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <View>
            <Text style={styles.sectionTitle}>Base Stats</Text>
            {pokemon.stats.map((s) => (
              <StatBar
                key={s.stat.name}
                stat={s.stat.name}
                value={s.base_stat}
                color={color}
              />
            ))}
            <View style={[styles.totalBox, { borderColor: color + '44' }]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={[styles.totalVal, { color }]}>
                {pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)}
              </Text>
            </View>
          </View>
        )}

        {/* Moves Tab */}
        {activeTab === 'moves' && (
          <View>
            <Text style={styles.sectionTitle}>First 20 Moves</Text>
            <View style={styles.movesGrid}>
              {pokemon.moves.slice(0, 20).map((m) => (
                <View key={m.move.name} style={[styles.moveBadge, { borderColor: color + '55' }]}>
                  <Text style={styles.moveText}>
                    {capitalize(m.move.name.replace(/-/g, ' '))}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <Text style={styles.pullHint}>Pull down to refresh</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },

  /* Header */
  header: {
    alignItems: 'center', paddingTop: 24, paddingBottom: 0,
    marginBottom: 0, position: 'relative', overflow: 'hidden',
  },
  ballDeco: {
    position: 'absolute', right: -50, top: -50,
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 3,
  },
  ballDecoInner: {
    position: 'absolute', left: -30, bottom: 20,
    width: 100, height: 100, borderRadius: 50,
  },
  idText: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  nameText: {
    color: '#F9FAFB', fontSize: 30, fontWeight: '900',
    textTransform: 'capitalize', marginVertical: 4,
  },
  category: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeBadge: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 20 },
  typeText: { color: '#fff', fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  image: { width: 200, height: 200 },

  /* Quick Stats */
  quickRow: {
    flexDirection: 'row', backgroundColor: '#1A1A2E',
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, paddingVertical: 16,
    justifyContent: 'space-around', alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2A3E',
  },
  quickItem: { alignItems: 'center', flex: 1 },
  quickVal: { color: '#F9FAFB', fontSize: 17, fontWeight: '800' },
  quickLabel: { color: '#9CA3AF', fontSize: 11, marginTop: 4, fontWeight: '600' },
  quickDivider: { width: 1, height: 32 },

  /* Tabs */
  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 16,
    backgroundColor: '#1A1A2E', borderRadius: 14,
    borderWidth: 1, borderColor: '#2A2A3E',
    overflow: 'hidden',
  },
  tab: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabText: { color: '#6B7280', fontSize: 13, fontWeight: '700' },

  /* Tab Content */
  tabContent: {
    backgroundColor: '#1A1A2E',
    marginHorizontal: 16, marginTop: 2,
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#2A2A3E',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F9FAFB', fontSize: 15, fontWeight: '800',
    marginBottom: 14, marginTop: 4,
  },
  descBox: {
    borderLeftWidth: 3, paddingLeft: 14, marginBottom: 20,
  },
  descText: { color: '#D1D5DB', fontSize: 14, lineHeight: 22 },

  /* Abilities */
  abilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  abilityBadge: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: '#0F0F1A', alignItems: 'center',
  },
  abilityText: { color: '#E5E7EB', fontSize: 13, fontWeight: '600' },
  hiddenTag: {
    marginTop: 4, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  hiddenText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  /* Stats */
  totalBox: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, marginTop: 6,
    backgroundColor: '#0F0F1A',
  },
  totalLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  totalVal: { fontSize: 22, fontWeight: '900' },

  /* Moves */
  movesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moveBadge: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: '#0F0F1A',
  },
  moveText: { color: '#D1D5DB', fontSize: 12, fontWeight: '600' },

  pullHint: {
    color: '#374151', fontSize: 11, textAlign: 'center',
    marginBottom: 30, marginTop: 4,
  },
});