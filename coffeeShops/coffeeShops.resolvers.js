import client from "../client";

export default {
    Category: {
        totalShops: ({ id }) => client.coffeeShop.count({
            where: {
                categories: {
                    some: {
                        id,
                    }
                }
            }
        })
    },
    CoffeeShop: {
        photos: ({ id }, { page }) => client.CoffeeShopPhoto.findMany({ 
            where: {
                shopId: id,
            },
            take: 5,
            skip: (page - 1) * 5,
        }),
        categories: ({ id }) => client.category.findMany({
            where: {
                shops: {
                    some: {
                        id,
                    },
                },
            },
        }),
        user: ({ userId }) => client.user.findUnique({
            where: {
                id: userId,
            },
        }),
    }
};