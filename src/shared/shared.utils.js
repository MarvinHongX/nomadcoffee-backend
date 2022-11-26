import AWS from "aws-sdk";

AWS.config.update({
    credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
    },
    region: "ap-northeast-2",
});
AWS.config.delete({
    credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
    },
    region: "ap-northeast-2",
});


const BUCKET = "marvincoffee-uploads";
const bucketInstance = new AWS.S3();


export const uploadToS3 = async (file, userId, folderName) => {
    const { filename, createReadStream } = await file;
    const readStream = createReadStream();
    const objectName = `${folderName}/${userId}-${Date.now()}-${filename}`;
    const { Location } = await bucketInstance
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
        await bucketInstance
            .deleteObject({
                Bucket: BUCKET,
                Key: `${folderName}/${filename}`,
            })
            .promise();
    }
};
