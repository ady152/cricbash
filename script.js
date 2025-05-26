import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFOIy-AC31RFfqWzxKklhawE7QAm5_D-I",
  authDomain: "cricbash-bab6c.firebaseapp.com",
  projectId: "cricbash-bab6c",
  storageBucket: "cricbash-bab6c.appspot.com",
  messagingSenderId: "361682550397",
  appId: "1:361682550397:web:eac03d09959365e93dfb14"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const playersList = [
  "J Sharma", "P Dubey", "R Dhawan", "Tanush Kotian", "Sai Sudarshan",
  "Suryakumar Yadav", "Kartik Tyagi", "Mayank Dagar", "Jasprit Bumrah",
  "MS Dhoni", "Virat Kohli", "Rohit Sharma", "S Tendulkar", "J Anderson",
  "Jos Buttler", "Pat Cummins", "M Starc", "Anmolpreet Singh", "Nitish Rana",
  "A Siddharth", "R Rossouw", "A Raghuvanshi", "S Gopal", "Theekshana"
];

let currentUser = null;

window.signup = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, "users", cred.user.uid), {
      coins: 1000,
      squad: [],
      dreamTeam: []
    });
    alert("Sign-up successful!");
  } catch (e) {
    alert(e.message);
  }
};

window.login = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    alert(e.message);
  }
};

window.logout = async () => {
  await signOut(auth);
  currentUser = null;
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("username").innerText = user.email;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const data = userDoc.data();
    document.getElementById("coins").innerText = data.coins;
    renderCards("squad", data.squad, true);
    renderCards("dream-team", data.dreamTeam, false);
  }
});

window.openStarterPack = async () => {
  if (!currentUser) return;
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  let { coins, squad } = snap.data();

  if (coins < 750) return alert("Not enough coins!");

  const pack = [];
  while (pack.length < 9) {
    const p = playersList[Math.floor(Math.random() * playersList.length)];
    if (!squad.includes(p) && !pack.includes(p)) pack.push(p);
  }

  await updateDoc(ref, {
    coins: coins - 750,
    squad: arrayUnion(...pack)
  });

  document.getElementById("coins").innerText = coins - 750;
  renderCards("squad", [...squad, ...pack], true);
};

function renderCards(sectionId, players, canAddToDream) {
  const container = document.getElementById(sectionId);
  container.innerHTML = "";
  players.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>${p}</strong>`;
    if (canAddToDream) {
      const btn = document.createElement("button");
      btn.textContent = "+ Dream Team";
      btn.onclick = () => addToDreamTeam(p);
      div.appendChild(btn);
    }
    container.appendChild(div);
  });
}

async function addToDreamTeam(player) {
  if (!currentUser) return;
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  let team = snap.data().dreamTeam;

  if (team.includes(player)) return alert("Already added!");
  if (team.length >= 11) return alert("Dream Team full!");

  team.push(player);
  await updateDoc(ref, { dreamTeam: team });
  renderCards("dream-team", team, false);
}
