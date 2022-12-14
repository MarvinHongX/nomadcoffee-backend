import bcrypt from "bcrypt";
import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import client from "../../client";
import { protectedResolver } from "../users.utils";
import { deleteFromS3, FOLDER_NAME, uploadToS3 } from "../../shared/shared.utils";

const resolverFn = async (
    _, 
    { username, email, name, location, password: newPassword, avatarURL: newAvatar, githubUsername }, 
    { loggedInUser }
) => {
    const oldUser = await client.user.findUnique({
        where: { 
            id: loggedInUser.id,
         },
        select: { username: true, avatarURL: true },
    });
    if (!oldUser){
        return {
            ok: false,
            error: "User not found.",
        }
    }
    let newAvatarURL = null;
    if (newAvatar) {
        await deleteFromS3(oldUser.avatarURL, FOLDER_NAME.avatars);
        newAvatarURL = await uploadToS3(newAvatar, loggedInUser.id, FOLDER_NAME.avatars);
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