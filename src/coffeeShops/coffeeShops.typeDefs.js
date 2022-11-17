import { gql } from "apollo-server-express";

export default gql`
    type Category {
        id: Int!
        name: String!
        slug: String!
        shops: [CoffeeShop]
        totalShops: Int!
        createdAt: String!
        updatedAt: String!
    }
    type CoffeeShop {
        id: Int!
        name: String!
        slug: String!
        latitude: String
        longitude: String
        user: User!
        photos(page: Int!): [CoffeeShopPhoto]
        categories: [Category]
        createdAt: String!
        updatedAt: String!
    }
    type CoffeeShopPhoto {
        id: Int!
        url: String!
        shop: CoffeeShop!
        createdAt: String!
        updatedAt: String!
    }
`;