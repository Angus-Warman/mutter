import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, setDoc, getDocs } from "firebase/firestore"; 

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

export async function createMessage(text: string) {
	if (!auth.currentUser) {
		return;
	}
	
	const collectionName = "conversations"
	const conversationName = "shared"
	const messagesName = "messages"
	const collectionRef = collection(db, collectionName, conversationName, messagesName)
	const messageRef = doc(collectionRef)
	const author = auth.currentUser.uid
	await setDoc(messageRef, { author, text });
}

export class Message {
	author: string | null;
	text: string;

	constructor(author: string | null, text: string) {
		this.author = author;
		this.text = text;
	}
}

export async function getMessages():  Promise<Message[]> {
	const collectionName = "conversations"
	const conversationName = "shared"
	const messagesName = "messages"
	const collectionRef = collection(db, collectionName, conversationName, messagesName)

	const messagesSnapshot = await getDocs(collectionRef);

	return messagesSnapshot.docs.map(doc => doc.data())
								.map(data => new Message(data['author'], data['text']));
}

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