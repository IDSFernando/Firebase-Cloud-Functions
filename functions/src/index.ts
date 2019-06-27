import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'


admin.initializeApp()

const path = require('path')
const vision = require('@google-cloud/vision')
const visionClient = new vision.ImageAnnotatorClient()

// Dedicated bucket for cloud function invocation
const bucketName = 'cloud-functions-soa.appspot.com'

export const imageTrigger = functions.storage.bucket(bucketName).object().onFinalize(
    async (object) => {
        console.log(object)
        const filePath = object.name
        const fileName = path.basename(filePath)
        const fileUrl = `gs://${bucketName}/${filePath}`
        const fileID = fileName.split('.jpg')[0]
        const docRef = admin.firestore().collection('photos').doc(fileID)
        const results = await visionClient.labelDetection(fileUrl)
        const labels = results[0].labelAnnotations.map((obj:any) => obj.description)
        return docRef.set(
            {labels}
        )
    }
)