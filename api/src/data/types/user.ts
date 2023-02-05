export const user = `

	type ScanInformation {
		lastScanDate: String
		scanAttempts: Int
	}

	type ApiUsage {
		usage: Int
		lastScanDate: String
	}

	type User {
		id: Int
		email: String
		password: String
		jwt: String
		loggedIn: Boolean
		alertEnabled: Boolean
		lastAlertSent: Int
		stripeToken: String
		role: Int
		activeSubscription: Boolean
		emailConfirmed: Boolean
		websites: [Website]
		history: [History]
		scanInfo: ScanInformation
		analytics(filter: String): [Analytic]
		scripts(filter: String): [Script]
		script(filter: String, url: String): Script
		paymentSubscription: PaymentSubScription
		apiUsage: ApiUsage
	}
`;
