import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { createMessage, subscribeToUsername, Message, signInn, signOutt, subscribeToNewMessage } from './backend';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, FormsModule],
	templateUrl: './app.html',
	styleUrl: './app.css'
})

export class App {
	username = signal(''); // Uses a signal, user is set automatically and async during launch which does not display until first UI interaction
	messages = signal<Message[]>([]);
	textToSend = '';

	constructor() {
		subscribeToUsername((username) => {
			this.username.set(username)
		})

		subscribeToNewMessage(this.addMessage.bind(this)) // ensure that "this" still has access to this.messages
	}
	
	addMessage(newMessage: Message) {
		this.messages.update(existingMessages => {
			var messages = [...existingMessages, newMessage]
			messages.sort((a, b) => a.id < b.id ? -1 : +1)
			return messages;
		});
	}

	async sendMessage() {
		const message_text = this.textToSend;
		this.textToSend = ''

		await createMessage(message_text)
	}

	async signIn() {
		signInn();
	}

	signOut() {
		signOutt()
	}
}