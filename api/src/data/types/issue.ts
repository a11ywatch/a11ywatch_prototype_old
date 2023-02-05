export const issue = ` 
	type Issue {
		code: String
		type: String
		typeCode: Int
		message: String
		context: String
		selector: String
		runner: String
		issue: String
		issues(filter: String): [Issue]
		url: String
		domain: String
		pageUrl: String
	}
`;
