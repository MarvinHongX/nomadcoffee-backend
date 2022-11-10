import { createWriteStream } from "fs";
import bcrypt from "bcrypt";
import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import client from "../../client";
import { protectedResolver } from "../users.utils";

const resolverFn = async (
    _, 
    { username, email, name, location, password: newPassword, avatarURL: newAvatar, githubUsername }, 
    { loggedInUser }
) => {
    let newAvatarURL = null;
    if (newAvatar) {
        const { filename, createReadStream } = await newAvatar;
        const newFilename = `${loggedInUser.id}-${Date.now()}-${filename}`;
        const readStream = createReadStream();
        const writeStream = createWriteStream(process.cwd() + "/uploads/" + newFilename);
        readStream.pipe(writeStream);
        newAvatarURL = `http://localhost:4000/static/${newFilename}`;
    }
    
    let uglyPassword = null;
    if (newPassword) {
        uglyPassword = await bcrypt.hash(newPassword, 10);
    }
    const updatedUser = await client.user.update({
        where:{
            id: loggedInUser.id,
        }, 
        data:{
            username, 
            email, 
            name, 
            location, 
            ...(uglyPassword && { password: uglyPassword }),
            ...(newAvatarURL && { avatarURL: newAvatarURL }),
            githubUsername,
        },
    });
    if (updatedUser.id) {
        return {
            ok: true,
        }
    } else {
        return {
            ok: false,
            error: "Couldn't update profile",
        };
    }
};

export default {
    Upload: GraphQLUpload,
    Mutation: {
        editProfile: protectedResolver(resolverFn),
    },
};