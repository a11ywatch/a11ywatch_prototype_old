export const subdomain = `
	type SubDomain {
		id: ID
		url: String
		user: User
		domain: String
		userId: Int
		adaScore: Float
		cdnConnected: Boolean
		pageLoadTime: PageLoadTimeMeta
		html: String
		htmlIncluded: Boolean
		issues(filter: String): [Issue]
		issuesInfo: IssueMeta
	}
`;
