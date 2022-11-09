import bcrypt from "bcrypt";
import client from "../../client";

export default {
    Mutation: {
        createAccount: async (
            _, 
            { username, email, name, location, password, avatarURL, githubUsername } 
        ) => {
            try {
                const existingUser = await client.user.findFirst({
                    where: {
                        OR: [
                            {
                                username,
                            },
                            {
                                email,
                            },
                        ],
                    },
                })
                if(existingUser){
                    return {
                        ok: false,
                        error: "This username/password is alrerady taken.",
                      };
                }        
                const uglyPassword = await bcrypt.hash(password, 10);
                const user = await client.user.create({
                    data: {
                        username, 
                        email, 
                        name, 
                        location, 
                        password: uglyPassword, 
                        avatarURL, 
                        githubUsername,
                    },
                });
                if (!user) {
                    return {
                        ok: false,
                        error: "Can't create account.",
                    }
                }
                return {
                    ok: true
                };
            } catch(e) {
                return e;
            }
        },

    },
}