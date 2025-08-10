import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FormsModule} from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

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
	protected readonly title = signal('mutter');

	current_user = '';
	message_to_send = '';
	messages: Message[] = [];

	async sendMessage() {
		var message = new Message(this.current_user, Date.now(), this.message_to_send);
		this.messages.push(message)
		this.message_to_send = ''
	}

	async signIn() {
		const result = await signInWithPopup(auth, provider);
		const credential = GoogleAuthProvider.credentialFromResult(result);

		if (credential) {
			const token = credential.accessToken;
			const user = result.user;
			this.current_user = user.displayName ?? "Anon";
		}

	}
}

class Message {
	author: string;
	sent: number;
	content: string;

	constructor(author: string, sent: number, content: string) {
		this.author = author;
		this.sent = sent;
		this.content = content;
	}
}