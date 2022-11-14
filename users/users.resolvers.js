import client from "../client";

export default {
    User: {
        followers: async({ id }) => {
            const page = 1;
            return await client.user
                .findUnique({ where: { id } })
                .followers({
                    take: 5,
                    skip: (page - 1) * 5,
                });
        },
        following: async({ id }) => {
            const page = 1;
            return await client.user
                .findUnique({ where: { id } })
                .following({
                    take: 5,
                    skip: (page - 1) * 5,
                });
        },
    }
};