import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  TextInput, TouchableOpacity, Dimensions, Keyboard,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const TYPE_COLORS = {
  fire: '#FF6B35', water: '#4A9EFF', grass: '#5DBE62', electric: '#F9CF30',
  psychic: '#FF6EA0', ice: '#74D7D7', dragon: '#6C5CE7', dark: '#6B5344',
  fairy: '#FF8EBF', normal: '#9B9B6A', fighting: '#C0392B', flying: '#8FA8E8',
  poison: '#9B59B6', ground: '#C8A84B', rock: '#9A8031', bug: '#7FAD18',
  ghost: '#5B4E8B', steel: '#8A8AB0', default: '#888',
};
const STAT_LABELS = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
};
const STAT_COLORS = {
  hp: '#FF5959', attack: '#F5AC78', defense: '#FAE078',
  'special-attack': '#9DB7F5', 'special-defense': '#A7DB8D', speed: '#FA92B2',
};
const STATS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

function getTypeColor(t) { return TYPE_COLORS[t] || TYPE_COLORS.default; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ─── Sizes derived from screen ─────────────────────────────────────────────
const CARD_H    = Math.round(height * 0.26);   // taller card
const IMG_SIZE  = Math.round(CARD_H * 0.60);   // bigger sprite
const INPUT_H   = 58;                           // tall search bar

// ─── Search input ──────────────────────────────────────────────────────────
function SearchInput({ number, onSearch, loading, error }) {
  const [val, setVal] = useState('');
  const accent = number === 1 ? '#CC0000' : '#2563EB';

  const go = () => {
    if (!val.trim()) return;
    Keyboard.dismiss();
    onSearch(val.trim().toLowerCase());
    setVal('');
  };

  return (
    <View style={si.wrap}>
      {/* Label above */}
      <Text style={[si.label, { color: accent }]}>Pokémon {number}</Text>
      <View style={[si.bar, { borderColor: accent }]}>
        <TextInput
          style={si.input}
          placeholder="Enter name or ID..."
          placeholderTextColor="#4B5563"
          value={val}
          onChangeText={setVal}
          onSubmitEditing={go}
          returnKeyType="search"
          autoCapitalize="none"
        />
        <TouchableOpacity style={[si.btn, { backgroundColor: accent }]} onPress={go}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={si.btnTxt}>GO</Text>}
        </TouchableOpacity>
      </View>
      {error ? <Text style={si.err} numberOfLines={1}>⚠ {error}</Text> : null}
    </View>
  );
}
const si = StyleSheet.create({
  wrap: { flex: 1 },
  label: {
    fontSize: 11, fontWeight: '900', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 5, paddingLeft: 2,
  },
  bar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E32', borderRadius: 14,
    borderWidth: 2, overflow: 'hidden', height: INPUT_H,
  },
  input: {
    flex: 1, color: '#F9FAFB', fontSize: 15,
    paddingVertical: 0, paddingHorizontal: 14,
  },
  btn: {
    height: INPUT_H, paddingHorizontal: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  btnTxt: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  err: { color: '#FCA5A5', fontSize: 11, marginTop: 5, paddingLeft: 4 },
});

// ─── Pokémon card ──────────────────────────────────────────────────────────
function PokeCard({ pokemon, accentColor, emptyLabel }) {
  const image =
    pokemon?.sprites?.other?.['official-artwork']?.front_default ||
    pokemon?.sprites?.front_default ||
    (pokemon?.id
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
      : null);

  const mainType = pokemon?.types?.[0]?.type?.name;
  const color = mainType ? getTypeColor(mainType) : accentColor;
  const total = pokemon?.stats?.reduce((s, x) => s + x.base_stat, 0) ?? 0;

  if (!pokemon) {
    return (
      <View style={[pc.card, { borderColor: accentColor + '44' }]}>
        <Text style={pc.emptyEmoji}>❓</Text>
        <Text style={pc.emptyTxt}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={[pc.card, { borderColor: color + '99', backgroundColor: color + '14' }]}>
      <View style={[pc.glow, { backgroundColor: color + '20' }]} />
      {image && <Image source={{ uri: image }} style={pc.img} resizeMode="contain" />}
      <Text style={pc.id}>#{String(pokemon.id).padStart(3, '0')}</Text>
      <Text style={pc.name} numberOfLines={1}>{cap(pokemon.name)}</Text>
      <View style={pc.types}>
        {pokemon.types.map(t => (
          <View key={t.type.name} style={[pc.badge, { backgroundColor: getTypeColor(t.type.name) }]}>
            <Text style={pc.badgeTxt}>{t.type.name}</Text>
          </View>
        ))}
      </View>
      <Text style={[pc.total, { color }]}>{total} pts</Text>
    </View>
  );
}
const pc = StyleSheet.create({
  card: {
    flex: 1, height: CARD_H,
    backgroundColor: '#1A1A2E',
    borderRadius: 20, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, paddingHorizontal: 6,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: IMG_SIZE * 1.4, height: IMG_SIZE * 1.4,
    borderRadius: (IMG_SIZE * 1.4) / 2,
  },
  img: { width: IMG_SIZE, height: IMG_SIZE },
  id: { color: '#6B7280', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  name: {
    color: '#F9FAFB', fontSize: 14, fontWeight: '900',
    textTransform: 'capitalize', marginTop: 1,
  },
  types: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  total: { fontSize: 12, fontWeight: '800', marginTop: 4 },
  emptyEmoji: { fontSize: 30, marginBottom: 6 },
  emptyTxt: { color: '#4B5563', fontSize: 12, textAlign: 'center', fontWeight: '600' },
});

// ─── Stat row ──────────────────────────────────────────────────────────────
function StatRow({ stat, val1, val2, winner }) {
  const color = STAT_COLORS[stat] || '#fff';
  const pct1 = Math.round((val1 / 255) * 100);
  const pct2 = Math.round((val2 / 255) * 100);

  return (
    <View style={sr.row}>
      {/* P1 side */}
      <View style={sr.side}>
        <Text style={[sr.val, { color: winner === 1 ? '#F9CF30' : '#E5E7EB', textAlign: 'right' }]}>
          {winner === 1 ? '👑 ' : ''}{val1}
        </Text>
        <View style={[sr.bgL]}>
          <View style={[sr.fillL, {
            width: `${pct1}%`,
            backgroundColor: color,
            opacity: winner === 2 ? 0.28 : 1,
          }]} />
        </View>
      </View>

      {/* Center label */}
      <View style={sr.center}>
        <Text style={[sr.label, { color }]}>{STAT_LABELS[stat]}</Text>
      </View>

      {/* P2 side */}
      <View style={sr.side}>
        <View style={sr.bgR}>
          <View style={[sr.fillR, {
            width: `${pct2}%`,
            backgroundColor: color,
            opacity: winner === 1 ? 0.28 : 1,
          }]} />
        </View>
        <Text style={[sr.val, { color: winner === 2 ? '#F9CF30' : '#E5E7EB', textAlign: 'left' }]}>
          {val2}{winner === 2 ? ' 👑' : ''}
        </Text>
      </View>
    </View>
  );
}
const sr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  side: { flex: 1, gap: 3 },
  val: { fontSize: 13, fontWeight: '800' },
  bgL: { height: 10, backgroundColor: '#252538', borderRadius: 5, overflow: 'hidden',
    flexDirection: 'row', justifyContent: 'flex-end' },
  bgR: { height: 10, backgroundColor: '#252538', borderRadius: 5, overflow: 'hidden' },
  fillL: { height: 10, borderRadius: 5 },
  fillR: { height: 10, borderRadius: 5 },
  center: { width: 62, alignItems: 'center', paddingHorizontal: 4 },
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 0.3, textAlign: 'center' },
});

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function CompareScreen() {
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1] = useState(null);
  const [error2, setError2] = useState(null);

  const doFetch = useCallback(async (q, set, setLoad, setErr) => {
    setLoad(true); setErr(null);
    try {
      const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
      if (!r.ok) throw new Error(`"${q}" not found`);
      set(await r.json());
    } catch (e) { setErr(e.message); }
    finally { setLoad(false); }
  }, []);

  const getWinner = (stat) => {
    if (!pokemon1 || !pokemon2) return null;
    const s1 = pokemon1.stats.find(s => s.stat.name === stat)?.base_stat ?? 0;
    const s2 = pokemon2.stats.find(s => s.stat.name === stat)?.base_stat ?? 0;
    if (s1 > s2) return 1;
    if (s2 > s1) return 2;
    return 0;
  };

  const total1 = pokemon1?.stats?.reduce((s, x) => s + x.base_stat, 0) ?? 0;
  const total2 = pokemon2?.stats?.reduce((s, x) => s + x.base_stat, 0) ?? 0;
  const ow = !pokemon1 || !pokemon2 ? null : total1 > total2 ? 1 : total2 > total1 ? 2 : 0;
  const both = pokemon1 && pokemon2;

  return (
    <View style={s.screen}>

      {/* ── Zone 1: Search ── */}
      <View style={s.searchRow}>
        <SearchInput
          number={1}
          onSearch={q => doFetch(q, setPokemon1, setLoading1, setError1)}
          loading={loading1}
          error={error1}
        />
        <View style={s.vsDivider}>
          <View style={s.vsLine} />
          <View style={s.vsBall}>
            <Text style={s.vsText}>VS</Text>
          </View>
          <View style={s.vsLine} />
        </View>
        <SearchInput
          number={2}
          onSearch={q => doFetch(q, setPokemon2, setLoading2, setError2)}
          loading={loading2}
          error={error2}
        />
      </View>

      {/* ── Zone 2: Pokémon cards ── */}
      <View style={s.pokeRow}>
        <PokeCard pokemon={pokemon1} accentColor="#CC0000" emptyLabel="Your fighter" />
        <View style={s.pokeDivider}>
          <View style={s.pokeVLine} />
          <Text style={s.swordEmoji}>⚔️</Text>
          <View style={s.pokeVLine} />
        </View>
        <PokeCard pokemon={pokemon2} accentColor="#2563EB" emptyLabel="Your opponent" />
      </View>

      {/* ── Zone 3: Stats ── */}
      <View style={s.statsPanel}>
        {both ? (
          <>
            {/* Winner banner */}
            <View style={[s.winnerBar, {
              borderColor: ow === 0 ? '#F9CF3055' : ow === 1 ? '#CC000099' : '#2563EB99',
            }]}>
              <View style={s.winnerSideBox}>
                <Text style={[s.winnerTotal, { color: ow === 1 ? '#F9CF30' : '#9CA3AF' }]}>{total1}</Text>
                <Text style={[s.winnerPoke, { color: ow === 1 ? '#fff' : '#6B7280' }]} numberOfLines={1}>
                  {cap(pokemon1.name)}
                </Text>
              </View>
              <View style={s.winnerCenter}>
                <Text style={s.winnerEmoji}>{ow === 0 ? '🤝' : '🏆'}</Text>
                <Text style={s.winnerLabel}>{ow === 0 ? 'TIE' : 'WINNER'}</Text>
                <Text style={[s.winnerName, {
                  color: ow === 0 ? '#F9CF30' : ow === 1 ? '#CC0000' : '#4A9EFF',
                }]} numberOfLines={1}>
                  {ow === 0 ? 'Both!' : cap(ow === 1 ? pokemon1.name : pokemon2.name)}
                </Text>
              </View>
              <View style={[s.winnerSideBox, { alignItems: 'flex-end' }]}>
                <Text style={[s.winnerTotal, { color: ow === 2 ? '#F9CF30' : '#9CA3AF' }]}>{total2}</Text>
                <Text style={[s.winnerPoke, { color: ow === 2 ? '#fff' : '#6B7280' }]} numberOfLines={1}>
                  {cap(pokemon2.name)}
                </Text>
              </View>
            </View>

            {/* Column headers */}
            <View style={s.colHeaders}>
              <Text style={[s.colName, { color: '#CC0000' }]} numberOfLines={1}>
                {cap(pokemon1.name)}
              </Text>
              <View style={{ width: 62 }} />
              <Text style={[s.colName, { color: '#2563EB', textAlign: 'right' }]} numberOfLines={1}>
                {cap(pokemon2.name)}
              </Text>
            </View>

            {/* Stat rows */}
            {STATS.map(stat => {
              const s1 = pokemon1.stats.find(x => x.stat.name === stat)?.base_stat ?? 0;
              const s2 = pokemon2.stats.find(x => x.stat.name === stat)?.base_stat ?? 0;
              return <StatRow key={stat} stat={stat} val1={s1} val2={s2} winner={getWinner(stat)} />;
            })}
          </>
        ) : (
          <View style={s.emptyPanel}>
            <Text style={s.emptyEmoji}>⚔️</Text>
            <Text style={s.emptyTitle}>Battle Arena</Text>
            <Text style={s.emptySub}>Search two Pokémon above to{'\n'}compare their stats!</Text>
          </View>
        )}
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1, backgroundColor: '#0F0F1A',
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10,
  },

  // Zone 1 — Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 0,
    marginBottom: 12,
  },
  vsDivider: {
    width: 36,
    alignItems: 'center',
    paddingTop: 22,     // aligns with input after label
    gap: 3,
  },
  vsLine: { width: 1.5, flex: 1, backgroundColor: '#2A2A3E' },
  vsBall: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#CC0000',
    justifyContent: 'center', alignItems: 'center',
  },
  vsText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  // Zone 2 — Cards
  pokeRow: {
    flexDirection: 'row',
    height: CARD_H,
    marginBottom: 12,
    alignItems: 'stretch',
  },
  pokeDivider: {
    width: 32, alignItems: 'center',
    justifyContent: 'center', gap: 4,
  },
  pokeVLine: { flex: 1, width: 1.5, backgroundColor: '#2A2A3E' },
  swordEmoji: { fontSize: 16 },

  // Zone 3 — Stats
  statsPanel: {
    flex: 1, backgroundColor: '#1A1A2E',
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#2A2A3E', padding: 14,
    justifyContent: 'center',
  },

  // Winner banner
  winnerBar: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#12121F', marginBottom: 12,
    gap: 6,
  },
  winnerSideBox: { flex: 1 },
  winnerTotal: { fontSize: 22, fontWeight: '900' },
  winnerPoke: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize', marginTop: 1 },
  winnerCenter: { alignItems: 'center', flex: 1 },
  winnerEmoji: { fontSize: 18 },
  winnerLabel: { color: '#6B7280', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginTop: 2 },
  winnerName: { fontSize: 13, fontWeight: '900', textTransform: 'capitalize', marginTop: 2 },

  // Column headers
  colHeaders: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 8, paddingHorizontal: 0,
  },
  colName: { flex: 1, fontSize: 12, fontWeight: '900', textTransform: 'capitalize' },

  // Empty
  emptyPanel: { alignItems: 'center' },
  emptyEmoji: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  emptySub: { color: '#4B5563', fontSize: 14, textAlign: 'center', lineHeight: 21 },
});