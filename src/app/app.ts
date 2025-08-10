import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FormsModule} from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, User, signOut } from "firebase/auth";
import { getData } from './backend';

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

		var data = await getData();

		if (data) {
			console.log("Got data", data)
			this.display_data.set(JSON.stringify(data))
		}
	}

	async sendMessage() {
		if (!this.current_user) {
			return;
		}

		var newMessage = new Message(this.current_user, Date.now(), this.message_to_send);
		
		this.messages.update(values => {
			return [...values, newMessage];
		});

		this.message_to_send = ''
	}

	async signIn() {
		if (this.current_user) {
			return;
		}

		await signInWithRedirect(auth, provider);
	}

	signOut() {
		signOut(auth)
	}
}

class Message {
	author: User;
	sent: number;
	content: string;

	constructor(author: User, sent: number, content: string) {
		this.author = author;
		this.sent = sent;
		this.content = content;
	}
}