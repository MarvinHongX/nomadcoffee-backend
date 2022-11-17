import { gql } from "apollo-server-express";

export default gql`
    type Query {
        seeCategory(name: String!, page: Int!): [CoffeeShop]
    }
`;