import { gql } from "apollo-server-express";

export default gql`
    type Mutation {
        createAccount(
            username: String!
            email: String!
            name: String!
            location: String
            password: String!
            avatarURL: String
            githubUsername: String
        ): MutationResponse!   
    }
`;