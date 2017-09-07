export class ChatUtil {
    static currentChatId: string;

    static setCurrentChatId(chatId: string) {
        this.currentChatId = chatId;
    }

    static isCurrentChatId(chatId: string): boolean {
        return this.currentChatId === chatId;
    }
}