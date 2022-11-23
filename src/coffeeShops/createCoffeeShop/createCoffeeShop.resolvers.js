import { createWriteStream } from "fs";
import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import client from "../../client";
import { protectedResolver } from "../../users/users.utils";
import { processCategories } from "../coffeeShops.utils";

export default {
    Upload: GraphQLUpload,
    Mutation: {
        createCoffeeShop: protectedResolver(
            async ( _, { name, latitude, longitude, categories, photos }, { loggedInUser }
            ) => {
                try {
                    const newCoffeeShopName = name.trim().toLowerCase();
                    const newCoffeeShopSlug = newCoffeeShopName.replace(/ +/g, "-");
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
                            name, 
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
                                const { filename, createReadStream } = await photos[i];
                                const newFilename = `${coffeeShop.id}-${loggedInUser.id}-${Date.now()}-${filename}`;
                                const readStream = createReadStream();
                                const writeStream = createWriteStream(process.cwd() + "/uploads/" + newFilename);
                                readStream.pipe(writeStream);
                                photoUrl = `https://marvincoffee.herokuapp.com/static/${newFilename}`;

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
                } catch(e) {
                    return e;
                }
            }
        )
        
    },
};