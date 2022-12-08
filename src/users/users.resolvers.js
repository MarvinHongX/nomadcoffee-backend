import client from "../client";

export default {
    User: {
        followers: ({ id }, { lastId }) => 
            client.user.findMany({
                where: {
                    following: {
                        some: {
                            id,
                        },
                    },
                },
                take: 5,
                skip: lastId ? 1 : 0,
                ...(lastId && { cursor: { id: lastId } }),
            }),
        following: ({ id }, { lastId })  =>
            client.user.findMany({
            where: {
                followers: {
                    some: {
                        id,
                    },
                },
            },
            take: 5,
            skip: lastId ? 1 : 0,
            ...(lastId && { cursor: { id: lastId } }),
        }),
        totalFollowers: ({ id }) => 
        client.user.count({
            where: {
                following: {
                    some: {
                        id,
                    },
                },
            },
        }),
        totalFollowing: ({ id }) => 
            client.user.count({
                where:{
                    followers: {
                        some: {
                            id,
                        },
                    },
                }
            }),
        isMe: ({ id }, _, { loggedInUser }) => {
            if (!loggedInUser) {
                return false;
            }
            return id === loggedInUser.id;
        },
        isFollowing: async ({ id }, _, { loggedInUser }) => {
            if (!loggedInUser) {
                return false;
            }
            const exists = await client.user.count({
                where: {
                    username: loggedInUser.username,
                    following: {
                        some: {
                            id,
                        },
                    },
                },
            });
            return Boolean(exists);
        },
        coffeeShops: ({ id }, { offset }) => client.user.findUnique({ where: { id }}).coffeeShops({
            take: 2,
            skip: offset,
            orderBy: {
                updatedAt: "desc", 
            },
        }),
    }
};