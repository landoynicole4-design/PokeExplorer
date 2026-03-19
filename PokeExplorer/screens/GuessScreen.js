import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image,
  TextInput, TouchableOpacity, Dimensions,
  KeyboardAvoidingView, Platform, SafeAreaView, StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const isSmall = height < 700;
const sp = (s, l) => isSmall ? s : l;

function getRandomPokemon(callback, onError) {
  const id = Math.floor(Math.random() * 151) + 1;
  fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(callback)
    .catch(() => onError?.('Could not load Pokémon. Check your connection.'));
}

function Pokeball({ size = 80 }) {
  return (
    <View style={[pb.ball, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={pb.top} /><View style={pb.mid} />
      <View style={pb.bot} />
      <View style={[pb.btn, {
        width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14,
        top: size / 2 - size * 0.14, left: size / 2 - size * 0.14,
      }]} />
    </View>
  );
}
const pb = StyleSheet.create({
  ball: { overflow: 'hidden', borderWidth: 3, borderColor: '#CC0000', backgroundColor: '#1A1A2E' },
  top:  { position: 'absolute', top: 0,    left: 0, right: 0, height: '50%', backgroundColor: '#CC0000' },
  mid:  { position: 'absolute', top: '46%',left: 0, right: 0, height: 4,     backgroundColor: '#CC0000' },
  bot:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: '#1A1A2E' },
  btn:  { position: 'absolute', backgroundColor: '#fff', borderWidth: 3, borderColor: '#CC0000', zIndex: 10 },
});

export default function GuessScreen() {
  const [pokemon,  setPokemon]  = useState(null);
  const [guess,    setGuess]    = useState('');
  const [revealed, setRevealed] = useState(false);
  const [score,    setScore]    = useState(0);
  const [streak,   setStreak]   = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [result,   setResult]   = useState(null);
  const [hintUsed, setHintUsed] = useState(false);

  useEffect(() => { loadNew(); }, []);

  const loadNew = useCallback(() => {
    setLoading(true); setError(null); setResult(null); setHintUsed(false);
    getRandomPokemon(
      data => { setPokemon(data); setGuess(''); setRevealed(false); setLoading(false); },
      err  => { setError(err); setLoading(false); },
    );
  }, []);

  const handleGuess = () => {
    if (!guess.trim() || !pokemon || result === 'correct') return;
    setAttempts(a => a + 1);
    if (guess.trim().toLowerCase() === pokemon.name.toLowerCase()) {
      setScore(s => s + 1); setStreak(s => s + 1);
      setRevealed(true); setResult('correct');
    } else {
      setStreak(0); setResult('wrong'); setGuess('');
      setTimeout(() => setResult(null), 900);
    }
  };

  const getHint = () => {
    if (!pokemon) return '';
    const n = pokemon.name;
    if (n.length <= 2) return n.toUpperCase();
    return n[0].toUpperCase() + '  _'.repeat(n.length - 2) + '  ' + n[n.length - 1].toUpperCase();
  };

  const image =
    pokemon?.sprites?.other?.['official-artwork']?.front_default ||
    pokemon?.sprites?.front_default ||
    (pokemon?.id
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
      : null);

  const accuracy  = attempts > 0 ? Math.round((score / attempts) * 100) : null;
  const pokeName  = pokemon ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) : '';

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <StatusBar barStyle="light-content" />
        <Pokeball size={88} />
        <Text style={s.loadTxt}>Finding a Pokémon...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={s.center}>
        <StatusBar barStyle="light-content" />
        <Text style={{ fontSize: 52, marginBottom: 14 }}>😵</Text>
        <Text style={s.errTxt}>{error}</Text>
        <TouchableOpacity style={s.tryBtn} onPress={loadNew}>
          <Text style={s.tryTxt}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 60}
      >

        {/* ════ TOP: Stats bar ════════════════════════════════════════════ */}
        <View style={s.statsBar}>
          {[
            { emoji: '⭐', val: score,    lbl: 'Score'    },
            { emoji: '🔥', val: streak,   lbl: 'Streak'   },
            { emoji: '🎯', val: attempts, lbl: 'Attempts' },
            ...(accuracy !== null ? [{ emoji: '📊', val: `${accuracy}%`, lbl: 'Accuracy' }] : []),
          ].map(({ emoji, val, lbl }, i, arr) => (
            <View key={lbl} style={s.statCell}>
              <Text style={s.statEmoji}>{emoji}</Text>
              <Text style={s.statNum}>{val}</Text>
              <Text style={s.statLbl}>{lbl}</Text>
              {i < arr.length - 1 && <View style={s.statDiv} />}
            </View>
          ))}
        </View>

        {/* ════ MIDDLE: Card (flex — fills remaining space) ═══════════════ */}
        <View style={[
          s.card,
          result === 'correct' && s.cardOk,
          result === 'wrong'   && s.cardBad,
        ]}>
          <TouchableOpacity
            style={s.imgArea}
            onPress={() => { if (!revealed) { setRevealed(true); setHintUsed(true); } }}
            activeOpacity={0.9}
            disabled={revealed}
          >
            <View style={s.imgGlow} />
            {image
              ? <Image source={{ uri: image }} style={s.sprite} resizeMode="contain" />
              : <Text style={{ color: '#4B5563' }}>No image</Text>
            }
            {!revealed && <View style={s.silhouette} pointerEvents="none" />}
            {!revealed && (
              <View style={s.tapPill} pointerEvents="none">
                <Text style={s.tapTxt}>👁️  Tap to reveal</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Card footer */}
          <View style={s.cardFooter}>
            <Text style={s.pokeId}>#{String(pokemon.id).padStart(3, '0')}</Text>
            {revealed
              ? <Text style={s.pokeName}>{pokeName}</Text>
              : <Text style={s.pokeQ}>Who is this Pokémon?</Text>
            }
          </View>
        </View>

        {/* ════ BOTTOM: Hint / feedback + inputs pinned to tab bar ════════ */}
        <View style={s.bottomBlock}>

          {/* Feedback / hint — sits above inputs */}
          <View style={s.feedRow}>
            {result === 'correct' && (
              <View style={s.bannerOk}>
                <Text style={s.bannerOkTxt}>🎉  Correct!  It's {pokeName}!</Text>
              </View>
            )}
            {result === 'wrong' && (
              <View style={s.bannerBad}>
                <Text style={s.bannerBadTxt}>❌  Not quite — try again!</Text>
              </View>
            )}
            {result === null && !revealed && !hintUsed && (
              <TouchableOpacity style={s.hintBtn} onPress={() => setHintUsed(true)}>
                <Text style={s.hintBtnTxt}>💡  Show name hint</Text>
              </TouchableOpacity>
            )}
            {result === null && hintUsed && !revealed && (
              <View style={s.hintBox}>
                <Text style={s.hintLbl}>Hint</Text>
                <View style={s.hintDot} />
                <Text style={s.hintLetters}>{getHint()}</Text>
              </View>
            )}
          </View>

          {/* Input row: [  Text field  ] [ GO ] */}
          {result !== 'correct' && (
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="Type Pokémon name…"
                placeholderTextColor="#4B5563"
                value={guess}
                onChangeText={setGuess}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleGuess}
              />
              <TouchableOpacity
                style={[s.goBtn, !guess.trim() && s.goBtnOff]}
                onPress={handleGuess}
                disabled={!guess.trim()}
              >
                <Text style={s.goBtnTxt}>GO</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Skip / Next — full width, flush to tab bar */}
          <TouchableOpacity
            style={result === 'correct' ? s.nextBtn : s.skipBtn}
            onPress={loadNew}
            activeOpacity={0.85}
          >
            <Text style={result === 'correct' ? s.nextTxt : s.skipTxt}>
              {result === 'correct' ? '✨  Next Pokémon' : '⏭  Skip'}
            </Text>
          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Design tokens ─────────────────────────────────────────────────────────
const PAD    = 16;
const GAP    = sp(8, 10);
const ROW_H  = sp(50, 54);   // unified height for input, GO, Skip — all equal

const s = StyleSheet.create({

  safe:   { flex: 1, backgroundColor: '#0F0F1A' },
  center: { flex: 1, backgroundColor: '#0F0F1A', alignItems: 'center', justifyContent: 'center' },

  kav: {
    flex: 1,
    paddingHorizontal: PAD,
    paddingTop: GAP,
    paddingBottom: GAP,
    gap: GAP,
  },

  // ── Stats bar ─────────────────────────────────────────────────────────
  statsBar: {
    height: sp(64, 70),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#252538',
  },
  statCell: {
    flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  statDiv: {
    position: 'absolute', right: 0, top: '15%',
    width: 1, height: '70%', backgroundColor: '#252538',
  },
  statEmoji: { fontSize: sp(14, 15) },
  statNum:   { color: '#F9FAFB', fontSize: sp(16, 18), fontWeight: '900', lineHeight: sp(20, 22) },
  statLbl:   { color: '#6B7280', fontSize: 9, fontWeight: '600', marginTop: 1 },

  // ── Card ──────────────────────────────────────────────────────────────
  card: {
    flex: 1,                          // fills ALL space between stats and bottomBlock
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#252538',
    overflow: 'hidden',
  },
  cardOk:  { borderColor: '#22C55E' },
  cardBad: { borderColor: '#EF4444' },

  imgArea: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgGlow: {
    position: 'absolute',
    width: width * 0.65, height: width * 0.65,
    borderRadius: width * 0.325,
    backgroundColor: 'rgba(204,0,0,0.06)',
  },
  sprite: {
    width: width * 0.58,
    height: width * 0.58,
  },
  silhouette: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0D0D1A', opacity: 0.93,
  },
  tapPill: {
    position: 'absolute', bottom: 14, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.60)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  tapTxt: { color: '#D1D5DB', fontSize: 12, fontWeight: '600' },

  cardFooter: {
    paddingVertical: sp(10, 12),
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#252538',
  },
  pokeId:   { color: '#6B7280', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  pokeName: { color: '#F9FAFB', fontSize: sp(18, 20), fontWeight: '900', textTransform: 'capitalize', marginTop: 2 },
  pokeQ:    { color: '#9CA3AF', fontSize: sp(12, 13), fontWeight: '600', marginTop: 2 },

  // ── Bottom block: feedback + input row + skip ─────────────────────────
  bottomBlock: {
    gap: GAP,
  },

  // Feedback / hint row
  feedRow: {
    height: ROW_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerOk: {
    width: '100%', height: ROW_H,
    backgroundColor: '#14532D', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#22C55E44',
  },
  bannerOkTxt: { color: '#86EFAC', fontSize: sp(12, 13), fontWeight: '800', textAlign: 'center' },
  bannerBad: {
    width: '100%', height: ROW_H,
    backgroundColor: '#450A0A', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#EF444444',
  },
  bannerBadTxt: { color: '#FCA5A5', fontSize: sp(12, 13), fontWeight: '700' },
  hintBtn: {
    height: ROW_H, paddingHorizontal: 28,
    backgroundColor: '#1A1A2E', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#F9CF3055',
  },
  hintBtnTxt: { color: '#F9CF30', fontSize: 14, fontWeight: '700' },
  hintBox: {
    flexDirection: 'row', alignItems: 'center',
    height: ROW_H, paddingHorizontal: 20,
    backgroundColor: '#1A1A2E', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#F9CF3044', gap: 10,
  },
  hintLbl:     { color: '#F9CF30', fontSize: 12, fontWeight: '800' },
  hintDot:     { width: 4, height: 4, borderRadius: 2, backgroundColor: '#F9CF3066' },
  hintLetters: { color: '#F9FAFB', fontSize: sp(13, 15), fontWeight: '900', letterSpacing: 4, textTransform: 'uppercase' },

  // Input row — input + GO side by side, same height
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    height: ROW_H,
  },
  input: {
    flex: 1,
    height: ROW_H,
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#F9FAFB',
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#CC0000',
  },
  goBtn: {
    width: ROW_H,             // square — same as height
    height: ROW_H,
    backgroundColor: '#CC0000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBtnOff: { backgroundColor: '#4B1A1A', opacity: 0.5 },
  goBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },

  // Skip / Next — full width, same height as input row
  skipBtn: {
    height: ROW_H,
    backgroundColor: 'transparent',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CC0000',
  },
  skipTxt: { color: '#CC0000', fontSize: sp(13, 14), fontWeight: '800' },

  nextBtn: {
    height: ROW_H,
    backgroundColor: '#CC0000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextTxt: { color: '#fff', fontSize: sp(13, 14), fontWeight: '900' },

  // ── Loading / Error ───────────────────────────────────────────────────
  loadTxt: { color: '#9CA3AF', marginTop: 22, fontSize: 15, fontWeight: '700' },
  errTxt: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 24, paddingHorizontal: 32, lineHeight: 22 },
  tryBtn: { backgroundColor: '#CC0000', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  tryTxt: { color: '#fff', fontSize: 15, fontWeight: '900' },
});