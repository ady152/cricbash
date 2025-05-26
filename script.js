import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFOIy-AC31RFfqWzxKklhawE7QAm5_D-I",
  authDomain: "cricbash-bab6c.firebaseapp.com",
  projectId: "cricbash-bab6c",
  storageBucket: "cricbash-bab6c.appspot.com",
  messagingSenderId: "361682550397",
  appId: "1:361682550397:web:eac03d09959365e93dfb14",
  measurementId: "G-7GVZGWVFRC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const openPackBtn = document.getElementById("open-pack-btn");
const userEmail = document.getElementById("user-email");
const cardContainer = document.getElementById("card-container");
const coinDisplay = document.getElementById("coin-display");

const provider = new GoogleAuthProvider();

const cards = [
  { id: "VK-01", name: "Virat Kohli", rating: 95, rarity: "legendary" },
  { id: "SS-01", name: "Shubman Gill", rating: 90, rarity: "epic" },
  { id: "RS-01", name: "Rohit Sharma", rating: 88, rarity: "rare" },
  { id: "JB-01", name: "Jasprit Bumrah", rating: 92, rarity: "epic" },
  { id: "HK-01", name: "Hardik Pandya", rating: 85, rarity: "rare" },
  { id: "YK-01", name: "Yuzvendra Chahal", rating: 80, rarity: "common" },
  { id: "AK-01", name: "Arshdeep Singh", rating: 78, rarity: "common" },
  { id: "MS-01", name: "MS Dhoni", rating: 96, rarity: "legendary" }
];

loginBtn.onclick = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const userRef = doc(db, "users", result.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, { coins: 750, cards: [] });
    }
  } catch (error) {
    console.error("Login error", error);
  }
};

logoutBtn.onclick = () => {
  signOut(auth);
};

openPackBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  if (data.coins < 750) {
    alert("Not enough coins!");
    return;
  }

  const newCards = [];
  const existingIds = new Set(data.cards || []);
  const availableCards = cards.filter(c => !existingIds.has(c.id));

  for (let i = 0; i < 9; i++) {
    if (availableCards.length === 0) break;
    const index = Math.floor(Math.random() * availableCards.length);
    newCards.push(availableCards[index].id);
    availableCards.splice(index, 1);
  }

  await updateDoc(userRef, {
    coins: data.coins - 750,
    cards: arrayUnion(...newCards)
  });

  loadUserCards(user.uid);
};

function renderCards(userCardIds) {
  cardContainer.innerHTML = "";
  const ownedCards = cards.filter(c => userCardIds.includes(c.id));
  ownedCards.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="card-images/${card.id}.png" onerror="this.src='card-images/default.png'" class="card-img" />
      <div class="card-name">${card.name}</div>
      <div class="card-rating">Rating: ${card.rating}</div>
      <div class="card-rarity ${card.rarity}">${card.rarity}</div>
    `;
    cardContainer.appendChild(div);
  });
}

async function loadUserCards(uid) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();
  coinDisplay.innerText = `Coins: ${data.coins}`;
  renderCards(data.cards || []);
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    openPackBtn.style.display = "inline-block";
    userEmail.innerText = user.email;
    loadUserCards(user.uid);
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    openPackBtn.style.display = "none";
    userEmail.innerText = "";
    coinDisplay.innerText = "";
    cardContainer.innerHTML = "";
  }
});

