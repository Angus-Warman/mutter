import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, User, signOut, signInWithPopup } from "firebase/auth";
import { createMessage, getData, getMessages, Message } from './backend';

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
getRedirectResult(auth).catch(e => { console.log(e) })

const provider = new GoogleAuthProvider();

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, FormsModule],
	templateUrl: './app.html',
	styleUrl: './app.css'
})

export class App {
	current_user_name = signal(''); // Uses a signal, user is set automatically and async during launch which does not display until first UI interaction

	current_user: User | null = null;
	message_to_send = '';
	messages = signal<Message[]>([]);

	display_data = signal('')

	constructor() {
		onAuthStateChanged(auth, (user) => {
			if (user) {
				this.current_user = user
				this.current_user_name.set(user.displayName ?? user.uid)
			}
			else {
				this.current_user = null
				this.current_user_name.set('')
			}
			
			this.backgroundRefresh()
		})
	}

	async backgroundRefresh() {
		if (!this.current_user) {
			return;
		}

		var messages = await getMessages();

		if (messages) {
			this.messages.set(messages);
		}
	}

	async sendMessage() {
		if (!this.current_user) {
			return;
		}

		const message_text = this.message_to_send;
		var newMessage = new Message(this.current_user.displayName, message_text);
		
		this.messages.update(values => {
			return [...values, newMessage];
		});

		this.message_to_send = ''

		await createMessage(message_text)
	}

	async signIn() {
		if (this.current_user) {
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

	signOut() {
		signOut(auth)
	}
}