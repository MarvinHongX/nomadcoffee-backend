import { gql } from "apollo-server-express";

export default gql`
    type User{
        id: Int!
        username: String!
        email: String!
        name: String!
        location: String
        avatarURL: String
        githubUsername: String
        followers(lastId: Int): [User]
        following(lastId: Int): [User]
        totalFollowers: Int!
        totalFollowing: Int!
        isMe: Boolean!
        isFollowing: Boolean!
        coffeeShops: [CoffeeShop]
        createdAt: String!
        updatedAt: String!
    }
`;