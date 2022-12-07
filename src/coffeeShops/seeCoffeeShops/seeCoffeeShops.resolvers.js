import client from "../../client"

export default {
    Query: {
        seeCoffeeShops: (_, { offset }) => client.coffeeShop.findMany({
            take: 2,
            skip: offset,
            orderBy: {
                updatedAt: "desc", 
            },
        }),
    },
};