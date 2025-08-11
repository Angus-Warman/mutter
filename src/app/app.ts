import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { createMessage, subscribeToUsername, Message, signIn, signOut, subscribeToMessages } from './backend';

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

		subscribeToMessages((messages) => {
			this.addMessages(messages);
		})
	}
	
	addMessages(newMessages: Message[]) {
		this.messages.update(existingMessages => {
			var messages = [...existingMessages, ...newMessages]
			messages.sort((a, b) => a.id < b.id ? -1 : +1)
			return messages;
		});
	}

	async sendMessage() {
		const message_text = this.textToSend;
		this.textToSend = ''

		await createMessage(message_text)
	}

	signIn() {
		signIn();
	}

	signOut() {
		signOut()
	}
}