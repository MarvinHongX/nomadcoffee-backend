import AWS from "aws-sdk";


const BUCKET = "marvincoffee-uploads";


export const uploadToS3 = async (file, userId, folderName) => {
    AWS.config.update({
        credentials: {
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET,
        },
    });
    
    const { filename, createReadStream } = await file;
    const readStream = createReadStream();
    const objectName = `${folderName}/${userId}-${Date.now()}-${filename}`;
    const { Location } = await new AWS.S3()
        .upload({
            Bucket: BUCKET,
            Key: objectName,
            ACL: "public-read-write",
            Body: readStream,
        })
        .promise();
    return Location;
};
/*
export const deleteFromS3 = async (fileUrl, folderName) => {
    AWS.config.update({
        credentials: {
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET,
        },
    });

    if (fileUrl){
        const decodeFileUrl = decodeURL(fileUrl);
        const filename = decodeFileUrl.split(`/${folderName}/`)[1];
        await new AWS.S3()
            .deleteObject({
                Bucket: BUCKET,
                Key: `${folderName}/${filename}`,
            })
            .promise();
    }
};
*/