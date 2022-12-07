import { gql } from "apollo-server-express";

export default gql`
    type Query {
        seeCoffeeShops(offset: Int!): [CoffeeShop]
    }
`;