const { initializeApp } = require("firebase/app");
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require("firebase/firestore");
const dotenv = require("dotenv");
const path = require("path");

// Load env variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function checkUser() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log("Conectando a Firestore para buscar estudiante@test.com...");
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", "estudiante@test.com"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log("No se encontró ningún usuario con el correo estudiante@test.com");
    return;
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();
  const userId = userDoc.id;
  console.log(`Usuario encontrado: ID=${userId}`, userData);

  console.log(`Buscando documento en studentGames para el ID=${userId}...`);
  const studentGameRef = doc(db, "studentGames", userId);
  const studentGameDoc = await getDoc(studentGameRef);

  if (!studentGameDoc.exists()) {
    console.log("No existe ningún documento en studentGames para este usuario.");
  } else {
    console.log("Datos en studentGames:", studentGameDoc.data());
  }
}

checkUser().catch(console.error);
