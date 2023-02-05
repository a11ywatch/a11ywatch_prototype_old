export const mutation = `

	type Mutation {

		ping (
			jwt: String
		): User

		register (
			email: String!
			password: String
			googleId: String
		): User

		login (
			email: String!
			password: String
			googleId: String
		): User

		updateUser (
			password: String
			newPassword: String
			stripeToken: String
		): UpdateUserMutationResponse

		toggleAlert (
			alertEnabled: Boolean
		): UpdateUserMutationResponse

		updateWebsite (
			url: String
			customHeaders: [CreatePageHeaders]
		): UpdateWebSiteMutationResponse

		updateScript (
			url: String
			scriptMeta: ScriptMetaInput
			editScript: Boolean
			newScript: String
		): UpdateScriptMutationResponse

		crawlWebsite (
			url: String
		): UpdateWebSiteMutationResponse

		scanWebsite (
			url: String
		): UpdateWebSiteMutationResponse

		forgotPassword (
			email: String
		): User
		
		confirmEmail (
			email: String
		): UpdateUserMutationResponse

		resetPassword (
			email: String
			resetCode: String
			jwt: String
		): User

		addWebsite (
			url: String!
			customHeaders: [CreatePageHeaders]
		): UpdateWebSiteMutationResponse

		removeWebsite (
			url: String
			deleteMany: Boolean
		): UpdateWebSiteMutationResponse

		addPaymentSubscription (
			stripeToken: String
		): UpdateUserMutationResponse

		cancelSubscription (
			email: String
		): UpdateUserMutationResponse

	}
  
	type UpdateWebSiteMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		website: Website
	}

	type UpdateUserMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		user: User
		alertEnabled: Boolean
	}

	type UpdateScriptMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		script: Script
	}

	interface MutationResponse {
		code: String!
		success: Boolean!
		message: String!
	}

`;
