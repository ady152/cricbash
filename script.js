import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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

const playersList = [
  "J Sharma", "P Dubey", "R Dhawan", "Tanush Kotian", "Sai Sudarshan",
  "Suryakumar Yadav", "Kartik Tyagi", "Mayank Dagar", "Jasprit Bumrah",
  "MS Dhoni", "V Kohli", "R Sharma", "S Tendulkar", "J Anderson", "J Buttler",
  "P Cummins", "M Starc", "Anmolpreet Singh", "N Rana", "A Siddharth",
  "R Rossouw", "A Raghuvanshi", "S Gopal", "M Theekshana"
];

let currentUser = null;

// Auth
window.signup = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, "users", userCred.user.uid), {
      coins: 1000,
      squad: [],
      dreamTeam: []
    });
    alert("Sign Up Success!");
  } catch (e) {
    alert(e.message);
  }
};

window.login = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    alert("Login Success!");
  } catch (e) {
    alert(e.message);
  }
};

window.logout = async () => {
  await signOut(auth);
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("auth-section").style.display = "block";
  alert("Logged out!");
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("username").innerText = user.email;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      document.getElementById("coins").innerText = userDoc.data().coins;
      renderSquad(userDoc.data().squad || []);
      renderDreamTeam(userDoc.data().dreamTeam || []);
    }
  }
});

// Pack Opening
window.openStarterPack = async () => {
  if (!currentUser) return;
  const userRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userRef);
  let { coins, squad } = userSnap.data();

  if (coins < 750) return alert("Not enough coins!");

  const newPlayers = [];
  while (newPlayers.length < 9) {
    const p = playersList[Math.floor(Math.random() * playersList.length)];
    if (!squad.includes(p) && !newPlayers.includes(p)) newPlayers.push(p);
  }

  await updateDoc(userRef, {
    coins: coins - 750,
    squad: arrayUnion(...newPlayers)
  });

  alert("Pack opened!");
  document.getElementById("coins").innerText = coins - 750;
  renderSquad([...squad, ...newPlayers]);
};

// UI Helpers
function renderSquad(squad) {
  const ul = document.getElementById("squad");
  ul.innerHTML = "";
  squad.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    const btn = document.createElement("button");
    btn.textContent = "+ Add to Dream";
    btn.onclick = () => addToDream(name);
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

function renderDreamTeam(dreamTeam) {
  const ul = document.getElementById("dream-team");
  ul.innerHTML = "";
  dreamTeam.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    ul.appendChild(li);
  });
}

async function addToDream(player) {
  if (!currentUser) return;
  const userRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userRef);
  const team = userSnap.data().dreamTeam || [];

  if (team.length >= 11) return alert("Dream Team full!");
  if (team.includes(player)) return alert("Already in Dream Team!");

  team.push(player);
  await updateDoc(userRef, { dreamTeam: team });
  renderDreamTeam(team);
}
