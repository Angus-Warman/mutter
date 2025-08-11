import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, onSnapshot, CollectionReference, DocumentReference } from "firebase/firestore"; 
import { generatePushID } from "./id";

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

export class Message {
	author: string;
	text: string;
	id: string;

	constructor(id: string, author: string, text: string) {
		this.id = id;
		this.author = author;
		this.text = text;
	}
}

function getConversation() {
	const collectionName = "conversations"
	const conversationName = "shared"
	const messagesName = "messages"
	const collectionRef = collection(db, collectionName, conversationName, messagesName)
	return collectionRef
}

export function subscribe(callback: (message: Message) => void) {
	const conversation = getConversation();

	onSnapshot(conversation, snapshot => {
		snapshot.docChanges().forEach(async change => {
			if (change.type == "added") {
				const authorID = change.doc.get('author')
				const author = await tryGetDisplayName(authorID)
				const text = change.doc.get('text')

				const message = new Message(change.doc.id, author, text);
				callback(message);
			}
		});
	});
}

export async function createMessage(text: string) {
	if (!auth.currentUser) {
		return;
	}
	
	const conversation = getConversation();
	const messageRef = createOrderedRef(conversation)
	const author = auth.currentUser.uid
	await setDoc(messageRef, { author, text });
}

export async function getMessages():  Promise<Message[]> {
	const conversation = getConversation();

	const messagesSnapshot = await getDocs(conversation);

	return messagesSnapshot.docs.map(doc => new Message(doc.id, doc.get('author'), doc.get('text')));
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

export async function registerProfile() {
	if (!auth.currentUser) {
		return;
	}

	const uid = auth.currentUser.uid
	const displayName = auth.currentUser.displayName ?? `user-${auth.currentUser.uid}`

	const collectionName = "profiles"
	const profileRef = doc(db, collectionName, uid)

	await setDoc(profileRef, { displayName })
}

async function getProfile(uid: string): Promise<string> {
	const collectionName = "profiles"
	const profileRef = doc(db, collectionName, uid)
	const profile = await getDoc(profileRef)
	return profile.get('displayName')
}

const displayNameCache = new Map<string, string>();

export async function tryGetDisplayName(uid: string) {
	let fallback = `User-${uid}`
	
	if (auth.currentUser?.uid == uid) {
		return auth.currentUser.displayName ?? fallback
	}

	if (displayNameCache.has(uid)) {
		return displayNameCache.get(uid) ?? fallback
	}

	// Get the profile from db
	try {
		const displayName = await getProfile(uid)

		if (displayName) {
			displayNameCache.set(uid, displayName);
			return displayName
		}
	}
	catch {
		// Do nothing
	}

	return fallback
}

function createOrderedRef(collectionRef: CollectionReference) : DocumentReference {
	const id = generatePushID();
	const docRef = doc(db, collectionRef.path, id)
	return docRef;
}