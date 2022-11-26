import bcrypt from "bcrypt";
import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import client from "../../client";
import { protectedResolver } from "../users.utils";
import { deleteFromS3, uploadToS3 } from "../../shared/shared.utils";

const resolverFn = async (
    _, 
    { username, email, name, location, password: newPassword, avatarURL: newAvatar, githubUsername }, 
    { loggedInUser }
) => {
    const FOLDERNAME = "avatars";
    const oldUser = await client.user.findUnique({
        where: { username },
    });
    if (!oldUser){
        return {
            ok: false,
            error: "User not found.",
        }
    }
    let newAvatarURL = null;
    if (newAvatar) {
        oldAvatarURL = await deleteFromS3(oldUser.avatarURL, FOLDERNAME);
        newAvatarURL = await uploadToS3(newAvatar, loggedInUser.id, FOLDERNAME);
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