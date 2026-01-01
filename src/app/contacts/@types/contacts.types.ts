export interface ConnectedContactList {
	userId: string;
	name: string | null;
	email: string;
	image: string | null;
	phone: string | null;
	connectedAt: Date;
}
