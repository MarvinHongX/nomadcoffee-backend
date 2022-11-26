import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import client from "../../client";
import { deleteFromS3, FOLDER_NAME, uploadToS3 } from "../../shared/shared.utils";
import { protectedResolver } from "../../users/users.utils";
import { processCategories } from "../coffeeShops.utils";

export default {
    Upload: GraphQLUpload,
    Mutation: {
        editCoffeeShop: protectedResolver(
            async (_, { id, name, latitude, longitude, categories, photos }, { loggedInUser }) => {
                const FOLDERNAME = "coffeeShopPhotos";
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

                const newCoffeeShopName = name ? name.trim().toLowerCase() : undefined;
                const newCoffeeShopSlug = name ? newCoffeeShopName.replace(/ +/g, "-") : undefined;
                if (name && (oldCoffeeShop.name !== name)) {
                    const existingCoffeeShop = await client.coffeeShop.findUnique({
                        where: {
                            slug: newCoffeeShopSlug,
                        },
                        select: { id: true },
                    });
                    if (existingCoffeeShop) {
                        return {
                            ok: false,
                            error: "This coffeeShop name is alrerady taken.",
                          };
                    }      
                }
                
                let categoryObj = [];
                if (categories) {
                    categoryObj = processCategories(categories);
                }

                let newCoffeeShop = await client.coffeeShop.update({
                    where: { id },
                    data: {
                        name: newCoffeeShopName,
                        slug: newCoffeeShopSlug,
                        latitude,
                        longitude,
                        categories: {
                            disconnect: oldCoffeeShop.categories,
                            connectOrCreate: categoryObj,
                        },          
                    },
                });
                if (!newCoffeeShop) {
                    return {
                        ok: false,
                        error: "Can't update coffeeShop.",
                    }
                }
                if (photos) {
                    const oldPhotos = await client.coffeeShopPhoto.findMany({
                        where: { shopId: id },
                    });
                
                    for (let i = 0; i < oldPhotos.length; i++) {
                        let oldPhotoUrl = null;
                        if (oldPhotos[i]) {
                            oldPhotoUrl = await deleteFromS3(oldPhotos[i].url, FOLDER_NAME.coffeeShopPhotos)
                            await client.coffeeShopPhoto.delete({
                                where: {
                                    id: oldPhotos[i].id,
                                },
                            });
                        }
                    }

                    for (let i = 0; i < photos.length; i++) {
                        let photoUrl = null;
                        if (photos[i]) {
                            photoUrl = await uploadToS3(photos[i], loggedInUser.id, FOLDER_NAME.coffeeShopPhotos)
                            const coffeeShopPhoto = await client.coffeeShopPhoto.create({
                                data: {
                                    url: photoUrl,
                                    shop: {
                                        connect: {
                                            id: newCoffeeShop.id,
                                        },
                                    },
                                },
                            });
                        }
                    }
                }

                return {
                    ok: true,
                };

            },
        ),
    },
};