import client from "../../client"

export default {
    Query: {
        searchCoffeeShops: async (_, { keyword, offset }) => {
            return await client.CoffeeShop.findMany({
                take: 15,
                skip: offset,
                where: {
                    OR: [
                        {
                            name: {
                                startsWith: keyword.toLowerCase(),
                            },
                        },
                        {
                            categories: {
                                some: { 
                                    name: {
                                        contains: keyword,
                                    },
                                },
                            },
                        }
                    ]
                },
                orderBy: {
                    updatedAt: "desc", 
                },
            })
        }
    }
}