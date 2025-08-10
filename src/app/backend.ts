import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, setDoc } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyBHoXHWqQok9WDrHTiGFLoHtUGAU6e6gSc",
  authDomain: "mutter-7f726.firebaseapp.com",
  projectId: "mutter-7f726",
  storageBucket: "mutter-7f726.firebasestorage.app",
  messagingSenderId: "380389097164",
  appId: "1:380389097164:web:910553448fc761f3814c69"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export async function getData() {
	if (!auth.currentUser) {
		console.log("Not logged in")
		return null;
	}

	const collectionName = "test"
	const docName = "test"
	const docRef = doc(db, collectionName, docName)
	const document = await getDoc(docRef)

	if (document.exists()) {
		return document.data();
	}
	else {
		console.log("Failed to get document")
		return null;
	}
}