import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, FormsModule],
	templateUrl: './app.html',
	styleUrl: './app.css'
})

export class App {
	protected readonly title = signal('mutter');

	current_user = 'Angus';
	message_to_send = '';
	messages: Message[] = [];

	async sendMessage() {
		var message = new Message(this.current_user, Date.now(), this.message_to_send);
		this.messages.push(message)
		this.message_to_send = ''
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