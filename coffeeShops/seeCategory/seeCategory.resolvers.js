import client from "../../client";

export default {
    Query: {
        seeCategory: (_, { name, page }) => client.coffeeShop.findMany({
            where: {
                categories: {
                    some: {
                        slug: {
                            contains: name,
                        },
                    },
                },
            },
            take: 5,
            skip: (page - 1) * 5,
        }),
    },
};