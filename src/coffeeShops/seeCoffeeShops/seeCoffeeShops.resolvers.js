import client from "../../client"

export default {
    Query: {
        seeCoffeeShops: (_, { page }) => client.coffeeShop.findMany({
            take: 5,
            skip: (page - 1) * 5,
            orderBy: {
                updatedAt: "desc", 
            },
        }),
    },
};