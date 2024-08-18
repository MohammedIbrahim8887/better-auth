import { GitHub } from "arctic";
import { toBetterAuthProvider } from "./to-provider";
import { betterFetch } from "@better-fetch/fetch";

interface GithubProfile {
	login: string;
	id: string;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
	name: string;
	company: string;
	blog: string;
	location: string;
	email: string;
	hireable: boolean;
	bio: string;
	twitter_username: string;
	public_repos: string;
	public_gists: string;
	followers: string;
	following: string;
	created_at: string;
	updated_at: string;
	private_gists: string;
	total_private_repos: string;
	owned_private_repos: string;
	disk_usage: string;
	collaborators: string;
	two_factor_authentication: boolean;
	plan: {
		name: string;
		space: string;
		private_repos: string;
		collaborators: string;
	};
	first_name: string;
	last_name: string;
}

export const github = toBetterAuthProvider("github", GitHub, {
	async getUserInfo(token) {
		const { data: profile, error } = await betterFetch<GithubProfile>(
			"https://api.github.com/user",
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token.accessToken}`,
				},
			},
		);
		if (error) {
			return null;
		}
		let emailVerified = false;
		if (!profile.email) {
			const { data, error } = await betterFetch<{
				email: string;
				primary: boolean;
				verified: boolean;
				visibility: "public" | "private";
			}[]>("https://api.github.com/user/emails", {
				headers: {
					Authorization: `Bearer ${token.accessToken}`,
					"User-Agent": "better-auth",
				},
			});
			if (!error) {
				profile.email = (data.find((e) => e.primary) ?? data[0])
					?.email as string;
				emailVerified = data.find(e => e.email === profile.email)?.verified ?? false
			}
		}
		return {
			id: profile.id,
			name: profile.name,
			email: profile.email,
			image: profile.avatar_url,
			emailVerified,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	},
});
