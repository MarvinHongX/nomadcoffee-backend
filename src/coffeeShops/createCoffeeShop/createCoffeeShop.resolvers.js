import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import client from "../../client";
import { FOLDER_NAME, uploadToS3 } from "../../shared/shared.utils";
import { protectedResolver } from "../../users/users.utils";
import { processCategories } from "../coffeeShops.utils";

export default {
    Upload: GraphQLUpload,
    Mutation: {
        createCoffeeShop: protectedResolver(
            async ( _, { name, latitude, longitude, categories, photos }, { loggedInUser }) => {
                const newCoffeeShopName = name ? name.trim().toLowerCase() : undefined;
                const newCoffeeShopSlug = name ? newCoffeeShopName.replace(/ +/g, "-") : undefined;
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

                let categoryObj = [];
                if (categories) {
                    categoryObj = processCategories(categories);
                }

                const coffeeShop = await client.coffeeShop.create({
                    data: {
                        name: newCoffeeShopName, 
                        slug: newCoffeeShopSlug,
                        latitude, 
                        longitude,
                        user: {
                            connect: {
                                id: loggedInUser.id,
                            },
                        },
                        ...(categoryObj.length > 0 && {
                            categories: {
                                connectOrCreate: categoryObj,
                            },
                        }),
                    },
                });
                if (!coffeeShop) {
                    return {
                        ok: false,
                        error: "Can't create coffeeShop.",
                    }
                }

                if (photos) {
                    for (let i = 0; i < photos.length; i++) {
                        let photoUrl = null;
                        if (photos[i]) {
                            photoUrl = await uploadToS3(photos[i], loggedInUser.id, FOLDER_NAME.coffeeShopPhotos)
                            const coffeeShopPhoto = await client.coffeeShopPhoto.create({
                                data: {
                                    url: photoUrl,
                                    shop: {
                                        connect: {
                                            id: coffeeShop.id,
                                        },
                                    },
                                },
                            });
                        }
                    }
                }

                return {
                    ok: true
                };
            },
        ),
    },
};