import { gql } from "apollo-server-express";

export default gql`
    type EditProfileResult {
        ok: Boolean!
        error: String
    }
    type Mutation {
        editProfile(
            username: String
            email: String
            name: String
            location: String
            password: String
            avatarURL: Upload
            githubUsername: String
        ): EditProfileResult!
    }
    scalar Upload
`;
