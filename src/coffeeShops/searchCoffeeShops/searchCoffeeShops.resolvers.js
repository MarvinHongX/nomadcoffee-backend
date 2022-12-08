import client from "../../client"

export default {
    Query: {
        searchCoffeeShops: async (_, { keyword }) => {
            return await client.CoffeeShop.findMany({
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
            })
        }
    }
}