# PokeExplorer 🎮

A cross-platform mobile application built with React Native and Expo that lets users explore the first 150 Pokemon using the free PokeAPI. Browse, search, filter by type, and view detailed stats, abilities, and moves for each Pokemon.

---

## Built With

- React Native
- Expo (SDK 54)
- PokeAPI (https://pokeapi.co) — free, no API key required
- 2–3 minute demo video showing the app:
---

## Features

- Browse all 150 original Pokemon in a grid layout
- Search Pokemon by name
- Filter by type (Fire, Water, Grass, Electric, and more)
- View detailed stats with visual progress bars
- See abilities, moves, and Pokedex descriptions
- Pull to refresh
- Loading indicators and error handling

---

## How to Run

1. Clone this repository
2. Open the folder in VS Code
3. Open the terminal and run:

```
npm install --legacy-peer-deps
npx expo start --clear
```

4. Download Expo Go on your phone
5. Scan the QR code to launch the app

---

## Reflection

**What API did you use?**

This app uses PokeAPI (https://pokeapi.co), a completely free and open RESTful API that provides detailed data about Pokemon. It requires no API key and returns data such as Pokemon names, types, stats, abilities, moves, species descriptions, and official artwork images. Two endpoints were used: the list endpoint to fetch the first 150 Pokemon, and the individual Pokemon endpoint to retrieve full details for each one.

**What problem does your app solve?**

PokeExplorer solves the problem of having no quick and convenient way to look up Pokemon information on mobile. Instead of browsing a website or flipping through a guidebook, users can open the app and instantly search for any Pokemon by name or filter them by type. For example, if a player wants to find all Fire-type Pokemon, they can tap the Fire filter and see all matching results immediately. The detail screen also provides all the important stats and abilities a player would need to make team-building decisions, making the app genuinely useful for both casual fans and competitive players.

**What was the most difficult part of the integration?**

The most challenging part was handling the API calls efficiently. Since PokeAPI requires a separate fetch request for each individual Pokemon to get full details, loading 150 Pokemon means making 150 simultaneous API calls using Promise.all. Managing the loading state, handling potential errors from any of those calls, and making sure the UI did not crash if one request failed required careful use of async/await, try/catch blocks, and conditional rendering. Ensuring the app stayed responsive while all that data was loading was a significant challenge that required thoughtful state management using useState and useEffect.

**What would you improve with more time?**

With more time, I would expand the app to include all 900+ Pokemon instead of just the original 150, and implement pagination or infinite scroll so the app loads Pokemon in batches rather than all at once. I would also add a favorites feature that lets users save their favorite Pokemon locally using AsyncStorage. Additionally, I would add evolution chain data so users can see how each Pokemon evolves, and include a comparison feature where users can put two Pokemon side by side to compare their stats. Better animations and smoother transitions between screens would also improve the overall user experience significantly.

---

## Screenshots

*Add screenshots of your app here*

---

## License

This project was built for educational purposes as part of a Mobile Application Development laboratory activity.
