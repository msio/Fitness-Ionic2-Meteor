export interface Membership {
    _id: string;
    name: string;
    icon: string;
}

export interface Location {
    _id: string;
    membershipId: string;
    geometry: Object;
    address: string;
}

export interface MemLoc {
    membership: Membership;
    location?: Location;
}

export interface Message {
    _id: string;
    chatId: string;
    content: string;
    ownership: string;
    nextOne: string;
    createdAt: Date;
    senderId: string;
}

export interface Chat {
    _id: string;
    picture: string;
    receiver: any;
    lastMessage: Message;
    memberIds: [string];
}

export interface LocationAddress {
    street: string;
    postalCode: string;
    city: string;
    country: string;
}