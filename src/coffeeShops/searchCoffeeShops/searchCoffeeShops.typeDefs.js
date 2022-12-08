import { gql } from "apollo-server-express";

export default gql`
    type Query {
        searchCoffeeShops(keyword: String!): [CoffeeShop]
    }
`;
