import AWS from "aws-sdk";

AWS.config.update({
    credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
    },
});

const BUCKET = "marvincoffee-uploads";


export const uploadToS3 = async (file, userId, folderName) => {
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

export const deleteFromS3 = async (fileUrl, folderName) => {
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
