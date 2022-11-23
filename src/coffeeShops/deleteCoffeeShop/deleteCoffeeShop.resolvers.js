import { unlinkSync } from "fs";
import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import client from "../../client";
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

             
                let deletedCoffeeShop = await client.coffeeShop.delete({
                    where: { id },
                });
                if (!deletedCoffeeShop) {
                    return {
                        ok: false,
                        error: "Can't delete coffeeShop.",
                    }
                }
                
                const oldPhotos = await client.coffeeShopPhoto.findMany({
                    where: { shopId: id },
                });
            
                for (let i = 0; i < oldPhotos.length; i++) {
                    const oldFilename = oldPhotos[i].url.replace("https://marvincoffee.herokuapp.com/static/", "");
                    unlinkSync(process.cwd() + `/uploads/${oldFilename}`); 
                    await client.coffeeShopPhoto.delete({
                        where: {
                            id: oldPhotos[i].id,
                        },
                    });
                }

                return {
                    ok: true,
                };

            },
        ),
    },
};