import { createWriteStream, unlinkSync } from "fs";
import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import client from "../../client";
import { protectedResolver } from "../../users/users.utils";
import { processCategories } from "../coffeeShops.utils";

export default {
    Upload: GraphQLUpload,
    Mutation: {
        editCoffeeShop: protectedResolver(
            async (_, { id, name, latitude, longitude, categories, photos }, { loggedInUser }) => {
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
                    console.log(oldPhotos);
                
                    for (let i = 0; i < oldPhotos.length; i++) {
                        const oldFilename = oldPhotos[i].url.replace("http://localhost:4000/static/", "");
                        console.log(oldFilename);
                        unlinkSync(process.cwd() + `/uploads/${oldFilename}`); 
                        await client.coffeeShopPhoto.delete({
                            where: {
                                id: oldPhotos[i].id,
                            },
                        });
                    }

                    for (let i = 0; i < photos.length; i++) {
                        let photoUrl = null;
                        if (photos[i]) {
                            const { filename, createReadStream } = await photos[i];
                            const newFilename = `${newCoffeeShop.id}-${loggedInUser.id}-${Date.now()}-${filename}`;
                            const readStream = createReadStream();
                            const writeStream = createWriteStream(process.cwd() + "/uploads/" + newFilename);
                            readStream.pipe(writeStream);
                            photoUrl = `http://localhost:4000/static/${newFilename}`;

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