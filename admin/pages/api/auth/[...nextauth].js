import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    async session({ session, token }) {
      session.user = token.user
      return session
    }
  },
  pages: {
    signIn: '/signin'
  }
}

export default NextAuth(authOptions)
