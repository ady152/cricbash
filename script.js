import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Your Firebase config (replace if needed)
const firebaseConfig = {
  apiKey: "AIzaSyBFOIy-AC31RFfqWzxKklhawE7QAm5_D-I",
  authDomain: "cricbash-bab6c.firebaseapp.com",
  projectId: "cricbash-bab6c",
  storageBucket: "cricbash-bab6c.firebasestorage.app",
  messagingSenderId: "361682550397",
  appId: "1:361682550397:web:eac03d09959365e93dfb14",
  measurementId: "G-7GVZGWVFRC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Player data sample (use your real cards later)
const allPlayers = [
  { id:"JS-01", name:"J Sharma", rating:82, role:"Wicket Keeper", rarity:"Rare" },
  { id:"PD-01", name:"P Dubey", rating:66, role:"Bowler Leggie", rarity:"Standard" },
  { id:"RD-01", name:"R Dhawan", rating:69, role:"All Rounder(FAST BOWLER)", rarity:"Standard" },
  { id:"TK-01", name:"Tanush Kotian", rating:70, role:"All Rounder Off Spinner", rarity:"Standard" },
  { id:"SS-01", name:"Sai Sudarshan", rating:85, role:"Batsman", rarity:"Rare" },
  { id:"SY-01", name:"Suryakumar Yadav", rating:91, role:"Batsman", rarity:"Elite" },
  { id:"KT-01", name:"Kartik Tyagi", rating:72, role:"Fast Bowler", rarity:"Standard" },
  { id:"MD-01", name:"Mayank Dagar", rating:68, role:"Left Arm Orthadox", rarity:"Standard" },
  { id:"JB-01", name:"Jasprit Bumrah", rating:96, role:"Fast Bowler", rarity:"Legendary" },
  { id:"MSD-01", name:"MS Dhoni", rating:97, role:"Wicket Keeper", rarity:"Legendary" },
  { id:"VK-01", name:"V Kohli", rating:97, role:"Batsman", rarity:"Legendary" },
  { id:"RS-01", name:"R Sharma", rating:97, role:"Batsman", rarity:"Legendary" },
  { id:"ST-01", name:"S Tendulkar", rating:99, role:"Batsman", rarity:"Icon" },
  { id:"JA-01", name:"J Anderson", rating:97, role:"Fast Bowler", rarity:"Icon" },
  { id:"JBT-01", name:"J Buttler", rating:92, role:"Wicket Keeper", rarity:"Elite" },
  { id:"PC-01", name:"P Cummins", rating:93, role:"All Rounder(FAST BOWLER)", rarity:"Legendary" },
  { id:"MST-01", name:"M Starc", rating:94, role:"Fast Bowler", rarity:"Legendary" },
  { id:"ASG-01", name:"Anmolpreet Singh", rating:70, role:"Batsman", rarity:"Standard" },
  { id:"NR-01", name:"N Rana", rating:77, role:"Batsman", rarity:"Standard" },
  { id:"ANS-01", name:"A Siddharth", rating:68, role:"Batsman", rarity:"Standard" },
  { id:"RR-01", name:"R Rossouw", rating:81, role:"Batsman", rarity:"Rare" },
  { id:"ARG-01", name:"A Raghuvanshi", rating:72, role:"Batsman", rarity:"Standard" },
  { id:"SG-01", name:"S Gopal", rating:74, role:"All Rounder (Leggie)", rarity:"Standard" },
  { id:"MT-01", name:"M Theekshana", rating:83, role:"Bowler(off)", rarity:"Rare" },
  { id:"LL-01", name:"L Livingstone", rating:75, role:"Batsman", rarity:"Standard" },
];

// Pack definitions
const packs = {
  starter: { cost: 750, playerCount: 9, rarities: ["Standard","Rare","Elite","Legendary","Icon"] },
  standard: { cost: 300, playerCount: 5, rarities: ["Standard","Rare"] },
  rare: { cost: 500, playerCount: 5, rarities: ["Rare","Elite"] },
  elite: { cost: 700, playerCount: 3, rarities: ["Elite","Legendary"] },
  legendary: { cost: 900, playerCount: 2, rarities: ["Legendary","Icon"] },
};

// DOM elements
const authSection = document.getElementById("auth-section");
const gameSection = document.getElementById("game-section");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnLogin = document.getElementById("btn-login");
const btnSignup = document.getElementById("btn-signup");
const btnLogout = document.getElementById("btn-logout");
const welcomeMsg = document.getElementById("welcome-msg");
const coinsSpan = document.getElementById("coins");
const authError = document.getElementById("auth-error");
const packButtons = document.querySelectorAll(".pack-btn");
const openedPlayersDiv = document.getElementById("opened-players");
const dreamTeamList = document.getElementById("dream-team-list");

// User data state
let currentUser = null;
let userData = {
  coins: 2000,
  cards: [],
  dreamTeam: [],
};

// Utility - show error
function showAuthError(msg) {
  authError.textContent = msg;
  setTimeout(() => { authError.textContent = ""; }, 4000);
}

// Render functions
function renderUserInfo() {
  welcomeMsg.textContent = `Welcome, ${currentUser.email}`;
  btnLogout.style.display = "inline-block";
}

function renderCoins() {
  coinsSpan.textContent = userData.coins;
}

function renderCards() {
  // Render dream team cards
  dreamTeamList.innerHTML = "";
  if (userData.dreamTeam.length === 0) {
    dreamTeamList.textContent = "No players added yet.";
    return;
  }
  userData.dreamTeam.forEach(pid => {
    const player = allPlayers.find(p => p.id === pid);
    if (!player) return;
    const card = createPlayerCard(player, false);
    dreamTeamList.appendChild(card);
  });
}

function createPlayerCard(player, canAddToDreamTeam = true) {
  const card = document.createElement("div");
  card.className = "player-card";
  const name = document.createElement("div");
  name.className = "player-name";
  name.textContent = player.name;
  const role = document.createElement("div");
  role.textContent = player.role;
  const rating = document.createElement("div");
  rating.textContent = `Rating: ${player.rating}`;
  const rarity = document.createElement("div");
  rarity.className = "rarity " + player.rarity;
  rarity.textContent = player.rarity;

  card.appendChild(name);
  card.appendChild(role);
  card.appendChild(rating);
  card.appendChild(rarity);

  if (canAddToDreamTeam && !userData.dreamTeam.includes(player.id)) {
    card.title = "Click to add to Dream Team";
    card.style.cursor = "pointer";
    card.onclick = () => {
      if (userData.dreamTeam.length >= 11) {
        alert("Dream Team limit reached (11 players max).");
        return;
      }
      userData.dreamTeam.push(player.id);
      saveUserData();
      renderCards();
    };
  }

  return card;
}

// Load user data from Firestore or create default
async function loadUserData(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    userData = docSnap.data();
  } else {
    // New user defaults
    userData = { coins: 2000, cards: [], dreamTeam: [] };
    await setDoc(docRef, userData);
  }
  renderCoins();
  renderCards();
}

// Save user data to Firestore
async function saveUserData() {
  if (!currentUser) return;
  const docRef = doc(db, "users", currentUser.uid);
  await setDoc(docRef, userData);
  renderCoins();
  renderCards();
}

// Handle login
btnLogin.addEventListener("click", async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    currentUser = userCredential.user;
    authSection.style.display = "none";
    gameSection.style.display = "block";
    renderUserInfo();
    await loadUserData(currentUser.uid);
  } catch (err) {
    showAuthError(err.message);
  }
});

// Handle signup
btnSignup.addEventListener("click", async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    currentUser = userCredential.user;
    authSection.style.display = "none";
    gameSection.style.display = "block";
    renderUserInfo();
    await loadUserData(currentUser.uid);
  } catch (err) {
    showAuthError(err.message);
  }
});

// Handle logout
btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  currentUser = null;
  userData = { coins: 2000, cards: [], dreamTeam: [] };
  authSection.style.display = "block";
  gameSection.style.display = "none";
  welcomeMsg.textContent = "";
  btnLogout.style.display = "none";
});

// Auto check auth state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    authSection.style.display = "none";
    gameSection.style.display = "block";
    renderUserInfo();
    await loadUserData(user.uid);
  } else {
    authSection.style.display = "block";
    gameSection.style.display = "none";
    welcomeMsg.textContent = "";
    btnLogout.style.display = "none";
  }
});

// Utility to get random players from allowed rarities, excluding already owned
function getRandomPlayers(count, allowedRarities) {
  const ownedSet = new Set(userData.cards);
  const filtered = allPlayers.filter(p => allowedRarities.includes(p.rarity) && !ownedSet.has(p.id));
  if (filtered.length === 0) return [];
  const selected = [];
  while (selected.length < count && filtered.length > 0) {
    const idx = Math.floor(Math.random() * filtered.length);
    selected.push(filtered.splice(idx, 1)[0]);
  }
  return selected;
}

// Handle pack purchase
packButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    const packType = btn.getAttribute("data-pack");
    const pack = packs[packType];
    if (!pack) return alert("Invalid pack.");
    if (userData.coins < pack.cost) return alert("Not enough coins!");

    // Deduct coins immediately & save
    userData.coins -= pack.cost;
    await saveUserData();

    // Get random players
    const newPlayers = getRandomPlayers(pack.playerCount, pack.rarities);

    if (newPlayers.length === 0) {
      alert("No new players available for this pack!");
      return;
    }

    // Add players to user's collection
    newPlayers.forEach(p => {
      if (!userData.cards.includes(p.id)) userData.cards.push(p.id);
    });

    await saveUserData();

    // Show opened players
    openedPlayersDiv.innerHTML = "";
    newPlayers.forEach(p => {
      const card = createPlayerCard(p, true);
      openedPlayersDiv.appendChild(card);
    });

    alert(`You opened ${newPlayers.length} new players!`);
  });
});

