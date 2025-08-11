import { initializeApp } from "firebase/app";
import { getAuth, getRedirectResult, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged, signOut as firebaseSignOut, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, setDoc, onSnapshot, CollectionReference, DocumentReference,  } from "firebase/firestore"; 
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

getRedirectResult(auth).catch(e => { alert(e) })

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

const provider = new GoogleAuthProvider();

export async function signIn() {
	if (auth.currentUser) {
		return;
	}

	try {
		await signInWithPopup(auth, provider)
	}
	catch (e) {
		console.error(e)
		signInWithRedirect(auth, provider)
	}
}

export function signOut() {
	firebaseSignOut(auth);
}

export function subscribeToUsername(callback: (username: string) => void) {
	onAuthStateChanged(auth, (user) => {
		if (user) {
			let displayName = user.displayName ?? `User-${user.uid}`
			callback(displayName)
		} else {
			callback('')
		}
	});
}

function getConversation() {
	const collectionName = "conversations"
	const conversationName = "shared"
	const messagesName = "messages"
	const collectionRef = collection(db, collectionName, conversationName, messagesName)
	return collectionRef
}

export function subscribeToMessages(callback: (messages: Message[]) => void) {
	const conversation = getConversation();

	onSnapshot(conversation, async snapshot => {
		const messages: Message[] = [];

		const changes = snapshot.docChanges();

		for (const change of changes) {
			if (change.type == "added") {
				const authorID = change.doc.get('author')
				const author = await tryGetDisplayName(authorID)
				const text = change.doc.get('text')

				const message = new Message(change.doc.id, author, text);
				messages.push(message);
			}
		}

		callback(messages);
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

onAuthStateChanged(auth, (_) => registerProfile())

async function registerProfile() {
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