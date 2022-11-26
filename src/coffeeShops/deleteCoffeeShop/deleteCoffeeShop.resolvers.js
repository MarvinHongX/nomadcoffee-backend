import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import client from "../../client";
import { FOLDER_NAME } from "../../shared/shared.utils";
import { protectedResolver } from "../../users/users.utils";

export default {
    Upload: GraphQLUpload,
    Mutation: {
        deleteCoffeeShop: protectedResolver(
            async (_, { id }, { loggedInUser }) => {
                const oldCoffeeShop = await client.coffeeShop.findFirst({
                    where: {
                        id,
                        userId: loggedInUser.id,
                    },
                    include: {
                        categories: {
                            select: {
                                slug: true,
                            },
                        },
                    },
                });
                if (!oldCoffeeShop) {
                    return {
                        ok: false,
                        error: "CoffeeShop not found."
                    }
                }
                
                const oldPhotos = await client.coffeeShopPhoto.findMany({
                    where: { shopId: id },
                });
            
                for (let i = 0; i < oldPhotos.length; i++) {
                    await deleteFromS3(oldPhotos[i].url, FOLDER_NAME.coffeeShopPhotos);
                    await client.coffeeShopPhoto.delete({
                        where: {
                            id: oldPhotos[i].id,
                        },
                    });
                }

                let deletedCoffeeShop = await client.coffeeShop.delete({
                    where: { id },
                });
                if (!deletedCoffeeShop) {
                    return {
                        ok: false,
                        error: "Can't delete coffeeShop.",
                    }
                }
                
                return {
                    ok: true,
                };

            },
        ),
    },
};