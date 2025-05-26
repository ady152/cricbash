import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBFOIy-AC31RFfqWzxKklhawE7QAm5_D-I",
  authDomain: "cricbash-bab6c.firebaseapp.com",
  projectId: "cricbash-bab6c",
  storageBucket: "cricbash-bab6c.appspot.com",
  messagingSenderId: "361682550397",
  appId: "1:361682550397:web:eac03d09959365e93dfb14"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const openPackBtn = document.getElementById("openPack");
const coinDisplay = document.getElementById("coinDisplay");
const userEmail = document.getElementById("userEmail");
const cardContainer = document.getElementById("cardContainer");

// Sign up
signupBtn.onclick = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      coins: 750,
      cards: []
    });
  } catch (err) {
    alert("Sign up failed: " + err.message);
  }
};

// Login
loginBtn.onclick = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert("Login failed: " + err.message);
  }
};

// Logout
logoutBtn.onclick = async () => {
  await signOut(auth);
};

// Auth state change
onAuthStateChanged(auth, async (user) => {
  if (user) {
    signupBtn.style.display = loginBtn.style.display = "none";
    logoutBtn.style.display = openPackBtn.style.display = "inline-block";
    userEmail.textContent = user.email;
    await loadUserData(user.uid);
  } else {
    signupBtn.style.display = loginBtn.style.display = "inline-block";
    logoutBtn.style.display = openPackBtn.style.display = "none";
    userEmail.textContent = "";
    coinDisplay.textContent = "";
    cardContainer.innerHTML = "";
  }
});

// Load user data
async function loadUserData(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    coinDisplay.textContent = `Coins: ${data.coins}`;
    displayCards(data.cards);
  }
}

// Display cards
function displayCards(cards) {
  cardContainer.innerHTML = "";
  cards.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    const img = document.createElement("img");
    img.src = `card-images/${card}.png`;
    img.onerror = () => {
      img.src = "card-images/default.png";
    };
    const name = document.createElement("p");
    name.textContent = card;
    cardEl.appendChild(img);
    cardEl.appendChild(name);
    cardContainer.appendChild(cardEl);
  });
}

// Open pack
openPackBtn.onclick = async () => {
  const user = auth.currentUser;
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  if (userData.coins < 750) {
    alert("Not enough coins!");
    return;
  }

  const allCards = ["MS-01", "VK-01", "RG-01", "SS-01", "RD-01"];
  const ownedCards = userData.cards;
  const newCards = [];

  for (let i = 0; i < 3; i++) {
    const remaining = allCards.filter(c => !ownedCards.includes(c) && !newCards.includes(c));
    if (remaining.length === 0) break;
    const card = remaining[Math.floor(Math.random() * remaining.length)];
    newCards.push(card);
  }

  await updateDoc(userRef, {
    coins: userData.coins - 750,
    cards: arrayUnion(...newCards)
  });

  await loadUserData(user.uid);
};
