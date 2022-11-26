import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import client from "../../client";
import { FOLDER_NAME } from "../../shared/shared.utils";
import { protectedResolver } from "../../users/users.utils";

export default {
    Upload: GraphQLUpload,
    Mutation: {
        deleteAccount: protectedResolver(
            async (_, { username }, { loggedInUser }) => {
                const oldUser = await client.user.findUnique({
                    where: { username },
                    select: { username: true, avatarURL: true },
                });
                if (!oldUser) {
                    return {
                        ok: false,
                        error: "User not found."
                    }
                }

             
                let deletedUser = await client.user.delete({
                    where: { username },
                });
                if (!deletedUser) {
                    return {
                        ok: false,
                        error: "Can't delete User.",
                    }
                }
                const oldCoffeeShops = await client.CoffeeShop.findMany({
                    where: { userId: loggedInUser.id },                 
                });
                for (let i = 0; i < oldCoffeeShops.length; i++) {
                    await client.CoffeeShop.delete({
                        where: {
                            id: oldCoffeeShops[i].id,
                        },
                    });
                    const oldPhotos = await client.coffeeShopPhoto.findMany({
                        where: { shopId: oldCoffeeShops[i].id },
                    });
                
                    for (let j = 0; j < oldPhotos.length; j++) {
                        await deleteFromS3(oldPhotos[j].url, FOLDER_NAME.coffeeShopPhotos);
                        await client.coffeeShopPhoto.delete({
                            where: {
                                id: oldPhotos[j].id,
                            },
                        });
                    }
                }   

                return {
                    ok: true,
                };

            },
        ),
    },
};